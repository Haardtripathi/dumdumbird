import Arweave from 'arweave';

type PermissionType = 'ACCESS_ADDRESS' | 'SIGN_TRANSACTION' | 'ACCESS_PUBLIC_KEY' | 'SIGNATURE';

interface ArConnectError extends Error {
    code?: string;
}

export const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
});

// Enhanced browser detection to include ArConnect mobile app
const getBrowserInfo = () => {
    if (typeof window === 'undefined') return 'server';

    const userAgent = window.navigator.userAgent.toLowerCase();

    // Check if ArConnect mobile app is available
    const isArConnectMobile = typeof window !== 'undefined' &&
        ('arweaveWallet' in window ||
            'arconnect' in window ||
            window.location.href.includes('arconnect://'));

    if (userAgent.includes('mobile')) {
        if (isArConnectMobile) return 'arconnect-mobile';
        if (userAgent.includes('ios')) return 'ios';
        if (userAgent.includes('android')) return 'android';
        return 'mobile';
    }
    return 'desktop';
};

// Updated installation instructions for mobile
const getInstallationInstructions = () => {
    const browser = getBrowserInfo();
    switch (browser) {
        case 'arconnect-mobile':
            return null; // No instructions needed, app is present
        case 'ios':
            return 'Please install ArConnect from the App Store: https://apps.apple.com/app/arconnect/id1607894720';
        case 'android':
            return 'Please install ArConnect from the Play Store: https://play.google.com/store/apps/details?id=io.arconnect.mobile';
        case 'mobile':
            return 'Please install ArConnect mobile app for your device';
        case 'desktop':
            return 'Please install ArConnect from https://arconnect.io';
        default:
            return 'Please install ArConnect from https://arconnect.io';
    }
};

// Enhanced ArConnect check for both mobile and desktop
const checkForArConnect = (): boolean => {
    if (typeof window === 'undefined') return false;

    // Check for various ways ArConnect might be available
    return (
        'arweaveWallet' in window ||
        'arconnect' in window ||
        window.location.href.includes('arconnect://')
    );
};

// Modified wait function with mobile support
const waitForArConnect = async (timeout = 2000): Promise<void> => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        if (checkForArConnect()) return;
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const instructions = getInstallationInstructions();
    if (instructions) {
        throw new Error(instructions);
    }
};

// Updated connect function with mobile handling
export async function connectToArConnect(): Promise<string> {
    try {
        await waitForArConnect();

        if (!checkForArConnect()) {
            const instructions = getInstallationInstructions();
            if (instructions) {
                throw new Error(instructions);
            }
        }

        // Handle both mobile and desktop connections
        const wallet = window.arweaveWallet || (window as any).arconnect;

        // Request permissions
        await wallet?.connect([
            'ACCESS_ADDRESS',
            'SIGN_TRANSACTION'
        ] as PermissionType[]);

        // Get wallet address
        const address = await wallet?.getActiveAddress();

        if (!address) {
            throw new Error('Failed to get wallet address. Please try again.');
        }

        return address;
    } catch (error) {
        const err = error as ArConnectError;

        if (err.code === 'PERMISSION_DENIED') {
            throw new Error('Connection rejected. Please approve the connection request.');
        }

        if (err.message?.includes('timeout')) {
            const instructions = getInstallationInstructions();
            throw new Error(instructions || 'Connection timed out. Please try again.');
        }

        throw new Error(err.message || 'Failed to connect to ArConnect. Please try again.');
    }
}

export async function disconnectFromArConnect(): Promise<void> {
    if (checkForArConnect()) {
        try {
            const wallet = window.arweaveWallet || (window as any).arconnect;
            await wallet?.disconnect();
        } catch (error) {
            console.error('Error disconnecting from ArConnect:', error);
            throw new Error('Failed to disconnect from ArConnect');
        }
    }
}

export async function isWalletConnected(): Promise<boolean> {
    if (!checkForArConnect()) return false;

    try {
        const wallet = window.arweaveWallet || (window as any).arconnect;
        const address = await wallet?.getActiveAddress();
        return !!address;
    } catch {
        return false;
    }
}