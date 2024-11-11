import { createDataItemSigner, connect, result, message } from '@permaweb/aoconnect';

const PROCESS_ID = "pV_6so3Up6OEhXorAquFN8783Ys-LXhZtQaGmQKP4DE"

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

        if (resultOutput && resultOutput.Messages && resultOutput.Messages.length > 0) {
            const messageData = JSON.parse(resultOutput.Messages[0].Data);

            if (messageData.status === 'success' && Array.isArray(messageData.data)) {
                return messageData.data.map((item) => ({
                    player: item.wallet || 'Unknown',
                    score: item.score || 0,
                    timestamp: Math.floor(item.timestamp / 1000) // Convert to seconds
                }));
            }
        }

        return [];
    } catch (error) {
        console.error('Error fetching all scores:', error);
        throw error;
    }
}

export async function fetchPlayerScores(): Promise<{ player: string; score: number; timestamp: number }[]> {
    try {
        const { signer } = await getAOInstance();

        // Send a request to fetch all scores
        const messageOutput = await message({
            process: PROCESS_ID,
            signer,
            tags: [{ name: 'Action', value: 'GetYourScores' }],
            data: '',
        });

        console.log('Fetch all scores message sent:', messageOutput);

        // Get the result of fetching scores
        const resultOutput = await result({
            message: messageOutput,
            process: PROCESS_ID,
        });

        console.log('Fetch scores result:', JSON.stringify(resultOutput, null, 2));

        if (resultOutput && resultOutput.Messages && resultOutput.Messages.length > 0) {
            const messageData = JSON.parse(resultOutput.Messages[0].Data);

            if (messageData.status === 'success' && Array.isArray(messageData.data)) {
                return messageData.data.map((item) => ({
                    player: item.wallet || 'Unknown',
                    score: item.score || 0,
                    timestamp: Math.floor(item.timestamp / 1000) // Convert to seconds
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


