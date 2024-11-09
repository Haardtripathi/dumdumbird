import Arweave from 'arweave';

export const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
});

export async function connectToArConnect() {
    if (typeof window.arweaveWallet === 'undefined') {
        throw new Error('ArConnect not found');
    }

    await window.arweaveWallet.connect(['ACCESS_ADDRESS', 'SIGN_TRANSACTION']);
    return await window.arweaveWallet.getActiveAddress();
}

export async function disconnectFromArConnect() {
    if (typeof window.arweaveWallet !== 'undefined') {
        await window.arweaveWallet.disconnect();
    }
}