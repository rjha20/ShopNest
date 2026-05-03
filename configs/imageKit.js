import ImageKit from "imagekit";

let imagekitClient;

const getImageKitClient = () => {
    if (imagekitClient) return imagekitClient;

    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !privateKey || !urlEndpoint) {
        throw new Error("Missing ImageKit environment variables");
    }

    imagekitClient = new ImageKit({
        publicKey,
        privateKey,
        urlEndpoint
    });

    return imagekitClient;
};

const imagekit = {
    upload: (...args) => getImageKitClient().upload(...args),
    url: (...args) => getImageKitClient().url(...args)
};

export default imagekit;
