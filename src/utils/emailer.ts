const SibApiV3Sdk = require('sib-api-v3-typescript')
import { logger } from './logger'

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
apiInstance.setApiKey(
	SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
	process.env.SENDINBLUE_API_KEY as string
)

export async function sendEmail(
	subject: string,
	htmlData: string,
	toEmail: string,
	toName: string
) {
	let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

	sendSmtpEmail.subject = subject
	sendSmtpEmail.htmlContent = htmlData
	sendSmtpEmail.sender = {
		name: 'Medium Clone',
		email: 'mediumclone@outlook.com'
	}
	sendSmtpEmail.to = [{ email: toEmail, name: toName }]
	sendSmtpEmail.replyTo = {
		email: 'mediumclone@outlook.com',
		name: 'Medium Clone'
	}

	apiInstance.sendTransacEmail(sendSmtpEmail).then(
		function (data: any) {
			logger.info(`${subject} Email send Succesfully.`)
		},
		function (error: any) {
			logger.error(`${subject} Email failed to send.`)
		}
	)
}
