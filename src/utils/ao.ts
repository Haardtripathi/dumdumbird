import { createDataItemSigner, connect, result, message } from '@permaweb/aoconnect';

const PROCESS_ID = 'RC9kXKwp7MOBcX4KVyhoz37vMDNL-iHcMaMorelYjB8';

let aoInstance: any = null;
let signer: any = null;
let isInitialized = false;

async function getAOInstance() {
    try {
        if (!aoInstance || !signer) {
            signer = createDataItemSigner(window.arweaveWallet);
            aoInstance = connect(signer);
        }
        return { ao: aoInstance, signer };
    } catch (error) {
        console.error('Error getting AO instance:', error);
        throw error;
    }
}

export async function initializeAO(walletAddress: string): Promise<void> {
    try {
        if (isInitialized) {
            console.log('AO already initialized');
            return;
        }

        const { signer } = await getAOInstance();
        if (!walletAddress) {
            throw new Error('Wallet address is required for initialization.');
        }

        // Send the initialization message
        const messageOutput = await message({
            process: PROCESS_ID,
            signer,
            tags: [
                { name: 'Action', value: 'Initialize' },
                { name: 'Wallet', value: walletAddress },
            ],
            data: "Initialization message"
        });

        console.log('Initialization message sent:', messageOutput);

        // Get the result of the initialization
        const resultOutput = await result({
            message: messageOutput,
            process: PROCESS_ID,
        });

        console.log('Result output:', JSON.stringify(resultOutput, null, 2));

        if (resultOutput) {
            console.log('AO initialization successful');
            isInitialized = true;
        } else {
            throw new Error('AO initialization failed: ' + JSON.stringify(resultOutput));
        }
    } catch (error) {
        console.error('Error initializing AO:', error);
        throw error;
    }
}

export async function saveScore(walletAddress: string, score: number): Promise<void> {
    try {
        const { signer } = await getAOInstance();

        // Send the score-saving message
        const messageOutput = await message({
            process: PROCESS_ID,
            signer,
            tags: [
                { name: 'Action', value: 'SaveScore' },
                { name: 'Score', value: score.toString() },
                { name: 'Wallet', value: walletAddress },
            ],
            data: score.toString(),
        });

        console.log('Save score message sent:', messageOutput);

        // Get the result of saving the score
        const resultOutput = await result({
            message: messageOutput,
            process: PROCESS_ID,
        });

        console.log('Save score result:', JSON.stringify(resultOutput, null, 2));

        if (!resultOutput) {
            throw new Error('Failed to save score: ' + JSON.stringify(resultOutput));
        }
    } catch (error) {
        console.error('Error saving score:', error);
        throw error;
    }
}

export async function fetchAllScores(): Promise<{ player: string; score: number; timestamp: number }[]> {
    try {
        const { signer } = await getAOInstance();

        // Send a request to fetch all scores
        const messageOutput = await message({
            process: PROCESS_ID,
            signer,
            tags: [{ name: 'Action', value: 'GetAllScores' }],
            data: '',
        });

        console.log('Fetch all scores message sent:', messageOutput);

        // Get the result of fetching scores
        const resultOutput = await result({
            message: messageOutput,
            process: PROCESS_ID,
        });

        console.log('Fetch scores result:', JSON.stringify(resultOutput, null, 2));

        if (resultOutput && resultOutput.Output && typeof resultOutput.Output === 'string') {
            const parsedOutput = JSON.parse(resultOutput.Output);

            if (parsedOutput.status === 'success' && Array.isArray(parsedOutput.data)) {
                return parsedOutput.data.map((item) => ({
                    player: item.player || 'Unknown',
                    score: item.score || 0,
                    timestamp: item.timestamp || Date.now() / 1000,
                }));
            }
        }

        return [];
    } catch (error) {
        console.error('Error fetching all scores:', error);
        throw error;
    }
}

export function resetAOConnection() {
    aoInstance = null;
    signer = null;
    isInitialized = false;
}





// import { createDataItemSigner, connect, result, message } from '@permaweb/aoconnect';

// const PROCESS_ID = 'RC9kXKwp7MOBcX4KVyhoz37vMDNL-iHcMaMorelYjB8';

// let aoInstance: any = null;
// let signer: any = null;
// let isInitialized = false;

// async function getAOInstance() {
//     try {
//         if (!aoInstance || !signer) {
//             signer = createDataItemSigner(window.arweaveWallet);
//             aoInstance = connect(signer);
//         }
//         return { ao: aoInstance, signer };

//     } catch (error) {
//         console.error('Error getting AO instance:', error);
//         throw error;
//     }
// }

// export async function initializeAO(walletAddress: string): Promise<void> {
//     try {
//         if (isInitialized) {
//             console.log('AO already initialized');
//             return;
//         }

//         const { signer } = await getAOInstance();

//         if (!walletAddress) {
//             throw new Error('Wallet address is required for initialization.');
//         }

//         const messageOutput = await message({
//             process: PROCESS_ID,
//             signer,
//             tags: [
//                 { name: 'Action', value: 'Initialize' },
//                 { name: 'Wallet', value: walletAddress },
//             ],
//             data: "Initialization message"
//         });

//         console.log('Initialization message sent:', messageOutput);

//         const resultOutput = await result({
//             message: messageOutput,
//             process: PROCESS_ID,
//         });

//         console.log('Result output:', JSON.stringify(resultOutput, null, 2));

//         if (resultOutput) {
//             console.log('AO initialization successful');
//             isInitialized = true;
//         } else {
//             throw new Error('AO initialization failed: ' + JSON.stringify(resultOutput));
//         }
//     } catch (error) {
//         console.error('Error initializing AO:', error);
//         throw error;
//     }
// }

// export async function saveScore(walletAddress: string, score: number): Promise<void> {
//     try {
//         const { signer } = await getAOInstance();

//         const messageOutput = await message({
//             process: PROCESS_ID,
//             signer,
//             tags: [
//                 { name: 'Action', value: 'SaveScore' },
//                 { name: 'Score', value: score.toString() },
//                 { name: 'Wallet', value: walletAddress },
//             ],
//             data: score.toString(),
//         });

//         console.log('Save score message sent:', messageOutput);

//         const resultOutput = await result({
//             message: messageOutput,
//             process: PROCESS_ID,
//         });

//         console.log('Save score result:', JSON.stringify(resultOutput, null, 2));

//         if (!resultOutput) {
//             throw new Error('Failed to save score: ' + JSON.stringify(resultOutput));
//         }
//     } catch (error) {
//         console.error('Error saving score:', error);
//         throw error;
//     }
// }

// export async function fetchAllScores(): Promise<{ player: string; score: number; timestamp: number }[]> {
//     try {
//         const { signer } = await getAOInstance();

//         const messageOutput = await message({
//             process: PROCESS_ID,
//             signer,
//             tags: [{ name: 'Action', value: 'GetAllScores' }],
//             data: '',
//         });

//         console.log('Fetch all scores message sent:', messageOutput);

//         const resultOutput = await result({
//             message: messageOutput,
//             process: PROCESS_ID,
//         });

//         console.log('Fetch scores result:', JSON.stringify(resultOutput, null, 2));

//         if (resultOutput && resultOutput.Output && typeof resultOutput.Output === 'string') {
//             const parsedOutput = JSON.parse(resultOutput.Output);

//             if (parsedOutput.status === 'success' && Array.isArray(parsedOutput.data)) {
//                 return parsedOutput.data.map((item) => ({
//                     player: item.player || 'Unknown',
//                     score: item.score || 0,
//                     timestamp: item.timestamp || Date.now() / 1000,
//                 }));
//             }

//             return [];
//         }

//     } catch (error) {
//         console.error('Error fetching all scores:', error);
//         throw error;
//     }
// }

// export function resetAOConnection() {
//     aoInstance = null;
//     signer = null;
//     isInitialized = false;
// }