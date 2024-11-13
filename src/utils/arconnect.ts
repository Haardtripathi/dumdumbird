'use client'

import { IO } from '@ar.io/sdk'

// Define base types
type PermissionType = 'ACCESS_ADDRESS' | 'SIGN_TRANSACTION' | 'ACCESS_PUBLIC_KEY' | 'SIGNATURE'

interface ArConnectError extends Error {
    code?: string
}

// Initialize IO SDK properly
const io = IO.init()

// Helper to safely get the wallet instance
const getWallet = (): any | null => {
    if (typeof window === 'undefined') return null
    return window?.arweaveWallet || (window as any).arconnect || null
}

// Check for ArConnect availability
const checkForArConnect = (): boolean => {
    if (typeof window === 'undefined') return false
    return getWallet() !== null || window?.location?.href?.includes('arconnect://')
}

// Get installation instructions based on platform
const getInstallationInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    const isArConnectMobile = checkForArConnect()

    if (userAgent.includes('mobile')) {
        if (isArConnectMobile) return null
        if (userAgent.includes('ios')) {
            return 'Please install ArConnect from the App Store: https://apps.apple.com/app/arconnect/id1607894720'
        }
        if (userAgent.includes('android')) {
            return 'Please install ArConnect from the Play Store: https://play.google.com/store/apps/details?id=io.arconnect.mobile'
        }
        return 'Please install ArConnect mobile app for your device'
    }
    return 'Please install ArConnect from https://arconnect.io'
}

// Wait for ArConnect with timeout
const waitForArConnect = async (timeout = 2000): Promise<void> => {
    const start = Date.now()
    while (Date.now() - start < timeout) {
        if (checkForArConnect()) return
        await new Promise(resolve => setTimeout(resolve, 100))
    }

    const instructions = getInstallationInstructions()
    if (instructions) {
        throw new Error(instructions)
    }
}

// Connect to ArConnect using ar.io SDK
export async function connectToArConnect(): Promise<string> {
    try {
        await waitForArConnect()

        if (!checkForArConnect()) {
            const instructions = getInstallationInstructions()
            if (instructions) {
                throw new Error(instructions)
            }
        }

        // Get gateways using ar.io SDK
        const gateways = await io.getGateways()
        // if (!gateways || gateways.length === 0) {
        //     throw new Error('No gateways available')
        // }

        const wallet = getWallet()
        if (!wallet) {
            throw new Error('ArConnect wallet not found')
        }

        // Request permissions
        await wallet.connect([
            'ACCESS_ADDRESS',
            'SIGN_TRANSACTION'
        ] as PermissionType[])

        // Get wallet address
        const address = await wallet.getActiveAddress()

        if (!address) {
            throw new Error('Failed to get wallet address. Please try again.')
        }

        return address
    } catch (error) {
        const err = error as ArConnectError

        if (err.code === 'PERMISSION_DENIED') {
            throw new Error('Connection rejected. Please approve the connection request.')
        }

        if (err.message?.includes('timeout')) {
            const instructions = getInstallationInstructions()
            throw new Error(instructions || 'Connection timed out. Please try again.')
        }

        throw new Error(err.message || 'Failed to connect to ArConnect. Please try again.')
    }
}

// Disconnect from ArConnect
export async function disconnectFromArConnect(): Promise<void> {
    if (checkForArConnect()) {
        try {
            const wallet = getWallet()
            if (wallet) {
                await wallet.disconnect()
            }
        } catch (error) {
            console.error('Error disconnecting from ArConnect:', error)
            throw new Error('Failed to disconnect from ArConnect')
        }
    }
}

// Check if wallet is connected
export async function isWalletConnected(): Promise<boolean> {
    if (!checkForArConnect()) return false

    try {
        const wallet = getWallet()
        if (!wallet) return false

        const address = await wallet.getActiveAddress()
        return !!address
    } catch {
        return false
    }
}
