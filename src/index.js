import dayjs from 'dayjs'
import { Router } from 'itty-router'
import Cookies from 'cookie'
import jwt from '@tsndr/cloudflare-worker-jwt'
import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import { queryNote, MD5, checkAuth, checkAppAuth, genRandomStr, returnPage, returnJSON, saltPw, getI18n } from './helper'
import { SECRET, APP_PASSWORD } from './constant'

// init
const router = Router()

router.get('/', async (request) => {
    const lang = getI18n(request)
    const { url } = request

    // 如果设置了应用密码，检查认证
    if (APP_PASSWORD) {
        const cookie = Cookies.parse(request.headers.get('Cookie') || '')
        const valid = await checkAppAuth(cookie)

        if (!valid) {
            // 显示应用密码输入页面
            return returnPage('AppAuth', { lang, returnUrl: '/' })
        }
    }

    // 验证通过，跳转到随机路径
    const newHash = genRandomStr(3)
    return Response.redirect(`${url}${newHash}`, 302)
})

router.get('/share/:md5', async (request) => {
    const lang = getI18n(request)
    const { md5 } = request.params
    const path = await SHARE.get(md5)

    if (!!path) {
        const { value, metadata } = await queryNote(path)

        return returnPage('Share', {
            lang,
            title: decodeURIComponent(path),
            content: value,
            ext: metadata,
        })
    }

    return returnPage('Page404', { lang, title: '404' })
})

router.get('/:path', async (request) => {
    const lang = getI18n(request)

    const { path } = request.params
    const title = decodeURIComponent(path)

    const { value, metadata } = await queryNote(path)

    // 检查笔记是否存在（value 或 metadata 有内容就认为存在）
    const noteExists = value || Object.keys(metadata).length > 0

    // 如果设置了应用密码且笔记不存在，需要验证应用密码
    if (APP_PASSWORD && !noteExists) {
        const cookie = Cookies.parse(request.headers.get('Cookie') || '')
        const valid = await checkAppAuth(cookie)

        if (!valid) {
            // 显示应用密码输入页面
            return returnPage('AppAuth', { lang, returnUrl: `/${path}` })
        }
    }

    // 笔记存在或已验证应用密码，继续原有逻辑
    const cookie = Cookies.parse(request.headers.get('Cookie') || '')

    if (!metadata.pw) {
        return returnPage('Edit', {
            lang,
            title,
            content: value,
            ext: metadata,
        })
    }

    const valid = await checkAuth(cookie, path)
    if (valid) {
        return returnPage('Edit', {
            lang,
            title,
            content: value,
            ext: metadata,
        })
    }

    return returnPage('NeedPasswd', { lang, title })
})

router.post('/auth/app', async request => {
    if (request.headers.get('Content-Type') === 'application/json') {
        const { passwd, returnUrl } = await request.json()

        if (APP_PASSWORD) {
            const inputHash = await saltPw(passwd)

            if (APP_PASSWORD === inputHash) {
                const token = await jwt.sign({ app: true }, SECRET)
                return returnJSON(0, {
                    redirect: returnUrl || '/'
                }, {
                    'Set-Cookie': Cookies.serialize('app_auth', token, {
                        path: '/',
                        expires: dayjs().add(7, 'day').toDate(),
                        httpOnly: true,
                    })
                })
            }
        }
    }

    return returnJSON(10005, 'App password auth failed!')
})

router.post('/:path/auth', async request => {
    const { path } = request.params
    if (request.headers.get('Content-Type') === 'application/json') {
        const { passwd } = await request.json()

        const { metadata } = await queryNote(path)

        if (metadata.pw) {
            const storePw = await saltPw(passwd)

            if (metadata.pw === storePw) {
                const token = await jwt.sign({ path }, SECRET)
                return returnJSON(0, {
                    refresh: true,
                }, {
                    'Set-Cookie': Cookies.serialize('auth', token, {
                        path: `/${path}`,
                        expires: dayjs().add(7, 'day').toDate(),
                        httpOnly: true,
                    })
                })
            }
        }
    }

    return returnJSON(10002, 'Password auth failed!')
})

router.post('/:path/pw', async request => {
    const { path } = request.params
    if (request.headers.get('Content-Type') === 'application/json') {
        const cookie = Cookies.parse(request.headers.get('Cookie') || '')
        const { passwd } = await request.json()

        const { value, metadata } = await queryNote(path)
        const valid = await checkAuth(cookie, path)

        if (!metadata.pw || valid) {
            const pw = passwd ? await saltPw(passwd) : undefined
            try {
                await NOTES.put(path, value, {
                    metadata: {
                        ...metadata,
                        pw,
                    },
                })

                return returnJSON(0, null, {
                    'Set-Cookie': Cookies.serialize('auth', '', {
                        path: `/${path}`,
                        expires: dayjs().subtract(100, 'day').toDate(),
                        httpOnly: true,
                    })
                })
            } catch (error) {
                console.error(error)
            }
        }

        return returnJSON(10003, 'Password setting failed!')
    }
})

router.post('/:path/setting', async request => {
    const { path } = request.params
    if (request.headers.get('Content-Type') === 'application/json') {
        const cookie = Cookies.parse(request.headers.get('Cookie') || '')
        const { mode, share } = await request.json()

        const { value, metadata } = await queryNote(path)
        const valid = await checkAuth(cookie, path)

        if (!metadata.pw || valid) {
            try {
                await NOTES.put(path, value, {
                    metadata: {
                        ...metadata,
                        ...mode !== undefined && { mode },
                        ...share !== undefined && { share },
                    },
                })

                const md5 = await MD5(path)
                if (share) {
                    await SHARE.put(md5, path)
                    return returnJSON(0, md5)
                }
                if (share === false) {
                    await SHARE.delete(md5)
                }


                return returnJSON(0)
            } catch (error) {
                console.error(error)
            }
        }

        return returnJSON(10004, 'Update Setting failed!')
    }
})

router.post('/:path', async request => {
    const { path } = request.params
    const { value, metadata } = await queryNote(path)

    const cookie = Cookies.parse(request.headers.get('Cookie') || '')
    const valid = await checkAuth(cookie, path)

    if (!metadata.pw || valid) {
        // OK
    } else {
        return returnJSON(10002, 'Password auth failed! Try refreshing this page if you had just set a password.')
    }

    const formData = await request.formData();
    const content = formData.get('t')

    // const { metadata } = await queryNote(path)

    try {
        await NOTES.put(path, content, {
            metadata: {
                ...metadata,
                updateAt: dayjs().unix(),
            },
        })

        return returnJSON(0)
    } catch (error) {
        console.error(error)
    }

    return returnJSON(10001, 'KV insert fail!')
})

router.all('*', (request) => {
    const lang = getI18n(request)
    return returnPage('Page404', { lang, title: '404' })
})

addEventListener('fetch', event => {
    const url = new URL(event.request.url)

    // 优先处理静态资源（支持 /static/ 前缀和直接路径）
    if (url.pathname.startsWith('/static/') || url.pathname.startsWith('/css/') || url.pathname.startsWith('/js/') || url.pathname.startsWith('/img/') || url.pathname === '/favicon.ico') {
        event.respondWith(
            getAssetFromKV(event, {
                mapRequestToAsset: req => {
                    // 移除 /static 前缀以匹配 bucket 中的实际路径
                    const url = new URL(req.url)
                    if (url.pathname.startsWith('/static/')) {
                        url.pathname = url.pathname.replace('/static', '')
                    }
                    return new Request(url.toString(), req)
                }
            }).catch(e => {
                return new Response('Not Found', { status: 404 })
            })
        )
        return
    }

    // 其他请求交给路由器处理
    event.respondWith(router.handle(event.request))
})
