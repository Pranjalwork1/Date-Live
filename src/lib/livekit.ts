import { AccessToken } from 'livekit-server-sdk';
import { LiveKitTokenResponse } from './types';

const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;

export const isLiveKitConfigured = Boolean(
  livekitUrl &&
  apiKey &&
  apiSecret &&
  !livekitUrl.includes('your-project') &&
  !apiKey.includes('your-livekit')
);

export async function createLiveKitToken(params: {
  roomCode: string;
  participantIdentity: string;
  participantName: string;
}): Promise<LiveKitTokenResponse> {
  const { roomCode, participantIdentity, participantName } = params;

  if (isLiveKitConfigured) {
    try {
      const at = new AccessToken(apiKey!, apiSecret!, {
        identity: participantIdentity,
        name: participantName,
        ttl: '12h',
      });

      at.addGrant({
        room: roomCode,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      });

      const token = await at.toJwt();

      return {
        token,
        serverUrl: livekitUrl!,
        roomName: roomCode,
        participantIdentity,
        participantName,
        isMock: false,
      };
    } catch (err) {
      console.error('Failed to generate real LiveKit token:', err);
    }
  }

  // Graceful fallback for local development before cloud keys are entered
  return {
    token: `dev_token_${Math.random().toString(36).substring(2, 12)}`,
    serverUrl: livekitUrl || 'wss://demo.livekit.cloud',
    roomName: roomCode,
    participantIdentity,
    participantName,
    isMock: true,
  };
}
