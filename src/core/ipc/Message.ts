

export interface PeerToken {
  type: 'chat' | 'inspector';
  id: string;
}

export const chatPeerToken: PeerToken = {
  type: 'chat',
  id: 'detached',
};

interface PeerMessage {
  peerToken: PeerToken;
}