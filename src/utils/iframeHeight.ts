import { addIframe, findIframe } from '../services/iframe.service'
import { User } from '../models/user.model'
import puppeteer from 'puppeteer'

export const calculateHeightHelper = (
	slope: number,
	yIntersection: number,
	width: number
) => {
	//using formulla y=mx + c
	return Math.round(slope * width + yIntersection)
}

export const launchBrowser = async () => {
	const browser = await puppeteer.launch({
		headless: true
	})

	//Replace puppeteer.launch with puppeteer.connect
	// const browser = await puppeteer.connect({
	// 	browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}`
	// })

	return browser
}

export const gistIframeHeight = async (url: string, user: User | undefined) => {
	// check if Iframe data already exists
	const iframe = await findIframe({ url })
	if (iframe) {
		return iframe.height
	}

	if (!user) {
		throw new Error('Access not allowed')
	}

	const browser = await launchBrowser()
	const page = await browser.newPage()

	await page.setViewport({
		width: 650,
		height: 960,
		deviceScaleFactor: 1
	})

	const content = String.raw`<!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
				<style>
					html,
					body {
						height: 100%;
						margin: 0;
						padding: 0;
						overflow: hidden;
					}
				</style>
      </head>
			<body>
				<script src="${url}"></script>
			</body>
    </html>`

	await page.goto(`https://iframe-placeholder.netlify.app`)
	await page.setContent(content)

	await page.waitForTimeout(1000)
	const elem = await page.$('.gist')
	const boundingBox = await elem?.boundingBox()
	await page.close()

	let contentHeight = boundingBox?.height!

	if (contentHeight) {
		//extra 24px to remove scrollbar
		contentHeight += 24
	}

	await addIframe({
		url,
		source: 'gist',
		height: contentHeight,
		userId: user?._id
	})

	await browser.close()
	return contentHeight
}

const instagramIframeHeightHelper = async (
	browser: puppeteer.Browser,
	content: string,
	viewPortWidth: number = 650
) => {
	const page = await browser.newPage()
	await page.setViewport({
		width: viewPortWidth,
		height: 960,
		deviceScaleFactor: 1
	})

	await page.goto(`https://iframe-placeholder.netlify.app`)

	await page.setContent(content)

	await page.waitForTimeout(1000)
	const elem = await page.$('iframe')
	const boundingBox = await elem?.boundingBox()

	await page.close()
	return boundingBox?.height
}

export const instagramIframeHeight = async (
	url: string,
	width: number,
	user: User | undefined
) => {
	//check if Iframe data already exists
	const iframe = await findIframe({ url })
	if (iframe) {
		return calculateHeightHelper(iframe.slope, iframe.yIntersection, width)
	}

	if (!user) {
		throw new Error('Access not allowed')
	}

	const browser = await launchBrowser()
	const content = String.raw`
	<!DOCTYPE html>
	<html>
		<head>
			<meta name="viewport" content="width=device-width, initial-scale=1" />
		</head>
		<style>
			html,
			body {
				height: 100%;
				margin: 0;
				padding: 0;
				overflow: hidden;
			}
		</style>
		<body>
			<iframe
				width="100%"
				frameborder="0"
				scrolling="no"
				src=${url}
			></iframe>
			<script async src="//www.instagram.com/embed.js"></script>
		</body>
	</html>
	`

	const heights = await Promise.all([
		instagramIframeHeightHelper(browser, content, 360),
		instagramIframeHeightHelper(browser, content)
	]).catch((error) => {
		throw new Error(`Error : ${error}`)
	})

	const [x1, y1, x2, y2] = [360, heights[0]!, 650, heights[1]!]

	const slope = (y2 - y1) / (x2 - x1)
	//using formulla y = m(x - x1) + y1 here x = 0
	const yIntersection = slope * (0 - x1) + y1

	await addIframe({
		url,
		source: 'instagram',
		slope,
		yIntersection,
		userId: user?._id
	})

	await browser.close()

	return calculateHeightHelper(slope, yIntersection, width)
}

const twitterIframeHeightHelper = async (
	browser: puppeteer.Browser,
	url: string,
	viewPortWidth: number = 650
) => {
	const page = await browser.newPage()
	await page.setViewport({
		width: viewPortWidth,
		height: 960,
		deviceScaleFactor: 1
	})
	await page.goto(url)
	await page.addStyleTag({ content: 'body{overflow: hidden}' })

	await page.waitForSelector('iframe')
	await page.waitForTimeout(5000)
	const elem = await page.$('body')
	const boundingBox = await elem?.boundingBox()

	await page.close()
	return boundingBox?.height
}

export const twitterIframeHeight = async (
	url: string,
	width: number,
	user: User | undefined
) => {
	//max-width allowed is 548px
	width = Math.min(width, 564)

	//min-width allowed is 320px
	width = Math.max(width, 336)

	//check if Iframe data already exists
	const iframe = await findIframe({ url })
	if (iframe) {
		//extra 16px to compensate for margin
		return calculateHeightHelper(iframe.slope, iframe.yIntersection, width) + 16
	}

	if (!user) {
		throw new Error('Access not allowed')
	}

	const browser = await launchBrowser()

	const heights = await Promise.all([
		twitterIframeHeightHelper(browser, url, 336),
		twitterIframeHeightHelper(browser, url, 564)
	]).catch((error) => {
		throw new Error(`Error : ${error}`)
	})

	const [x1, y1, x2, y2] = [336, heights[0]!, 564, heights[1]!]

	const slope = (y2 - y1) / (x2 - x1)
	//using formulla y = m(x - x1) + y1 here x = 0
	const yIntersection = slope * (0 - x1) + y1

	await addIframe({
		url,
		source: 'twitter',
		slope,
		yIntersection,
		userId: user?._id
	})

	await browser.close()

	//extra 16px to compensate for margin
	return calculateHeightHelper(slope, yIntersection, width) + 16
}
