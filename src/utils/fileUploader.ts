import ImageKit from 'imagekit'

var imagekit = new ImageKit({
	publicKey: 'public_tWkuaPLosHAB+5BXxo6m4I5ema0=',
	privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
	urlEndpoint: 'https://ik.imagekit.io/medium'
})

export async function imageUploader(
	data: string | Buffer,
	name: string,
	folder: string,
	useUniqueFileName: boolean = true
) {
	return imagekit.upload({
		file: data, //required
		fileName: name,
		folder: `/images/${folder}/`,
		useUniqueFileName
	})
}
