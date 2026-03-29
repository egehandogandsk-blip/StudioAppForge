/**
 * Flippy Studio - Engine Bridge (Transpiler)
 * 
 * This service acts as the live-sync bridge between Flippy Studio and Game Engines
 * (Unity, Unreal Engine, Godot). It transpires Fabric.js/Pixi.js JSON payloads 
 * into intermediate Protobuf/JSON schemas that plugins within the engines consume
 * to rebuild the UI natively (e.g., Unity UI Toolkit, Unreal UMG).
 */

export type EngineType = 'unity' | 'unreal' | 'godot';
export type SyncStatus = 'disconnected' | 'connecting' | 'connected' | 'syncing' | 'error';

interface FlippyNode {
    id: string;
    type: 'rect' | 'circle' | 'text' | 'image' | 'group';
    properties: Record<string, any>;
    children?: FlippyNode[];
}

export class EngineBridge {
    private socket: WebSocket | null = null;
    private engineType: EngineType = 'unity';
    private statusListeners: Array<(status: SyncStatus) => void> = [];
    private currentStatus: SyncStatus = 'disconnected';

    constructor() {
        console.log('[EngineBridge] Initialized.');
    }

    /**
     * Connects to the local running game engine plugin (e.g., ws://localhost:8080)
     */
    public connect(engine: EngineType, port: number = 8080) {
        this.engineType = engine;
        this.updateStatus('connecting');

        try {
            // Mock WebSocket connection
            this.socket = new WebSocket(`ws://localhost:${port}`);

            this.socket.onopen = () => {
                console.log(`[EngineBridge] Connected to ${engine} at port ${port}`);
                this.updateStatus('connected');
            };

            this.socket.onclose = () => {
                console.log(`[EngineBridge] Disconnected from ${engine}`);
                this.updateStatus('disconnected');
            };

            this.socket.onerror = (error) => {
                console.error(`[EngineBridge] Connection error:`, error);
                this.updateStatus('error');
                
                // For demo purposes, we will mock a successful connection if the actual WS fails
                // since there is no real local server running yet.
                setTimeout(() => {
                    console.log(`[EngineBridge] Mocking successful connection to ${engine}`);
                    this.updateStatus('connected');
                }, 1500);
            };

            this.socket.onmessage = (event) => {
                this.handleIncoming(event.data);
            };
        } catch (e) {
            console.error('[EngineBridge] Failed to initiate connection', e);
            this.updateStatus('error');
        }
    }

    public disconnect() {
        if (this.socket) {
            this.socket.close();
        }
        this.updateStatus('disconnected');
    }

    /**
     * Pushes the current canvas JSON state to the game engine
     */
    public pushToEngine(canvasJSON: any) {
        if (this.currentStatus !== 'connected') {
            console.warn('[EngineBridge] Cannot push, engine not connected.');
            return;
        }

        this.updateStatus('syncing');

        // 1. Parse Fabric.js JSON
        const transpiled = this.transpile(canvasJSON);

        // 2. Send over WebSocket
        const payload = JSON.stringify({
            action: 'UPDATE_UI',
            target: this.engineType,
            data: transpiled
        });

        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(payload);
        }

        console.log(`[EngineBridge] Pushed payload to ${this.engineType}:`, transpiled);

        setTimeout(() => this.updateStatus('connected'), 800);
    }

    /**
     * Pulls the UI hierarchy from the game engine into Flippy Studio
     */
    public pullFromEngine(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.currentStatus !== 'connected') {
                reject('Engine not connected');
                return;
            }

            this.updateStatus('syncing');

            // Mock pull request
            console.log(`[EngineBridge] Pulling UI hierarchy from ${this.engineType}...`);
            
            setTimeout(() => {
                this.updateStatus('connected');
                resolve({ message: 'Mock payload pulled successfully' });
            }, 1000);
        });
    }

    /**
     * The core transpile function. Maps Web canvas nodes to Native UI engine nodes.
     */
    private transpile(fabricJSON: any): FlippyNode[] {
        // Implementation of the cross-engine AST (Abstract Syntax Tree) translator
        if (!fabricJSON || !fabricJSON.objects) return [];

        return fabricJSON.objects.map((obj: any) => {
            const node: FlippyNode = {
                id: obj.id || crypto.randomUUID(),
                type: this.mapType(obj.type),
                properties: {
                    x: obj.left,
                    y: obj.top,
                    width: obj.width * (obj.scaleX || 1),
                    height: obj.height * (obj.scaleY || 1),
                    opacity: obj.opacity,
                    fill: obj.fill,
                    // Additional specific mappings for Unity UI Toolkit / Unreal UMG go here
                }
            };

            if (obj.type === 'textbox' || obj.type === 'i-text') {
                node.properties.text = obj.text;
                node.properties.fontSize = obj.fontSize;
                node.properties.fontFamily = obj.fontFamily;
                node.properties.color = obj.fill;
            }

            return node;
        });
    }

    private mapType(fabricType: string): 'rect' | 'circle' | 'text' | 'image' | 'group' {
        switch (fabricType) {
            case 'rect': return 'rect';
            case 'circle': return 'circle';
            case 'textbox':
            case 'i-text': 
                return 'text';
            case 'image': return 'image';
            case 'group': return 'group';
            default: return 'group';
        }
    }

    // --- Observable Pattern for UI Updates ---
    public subscribe(listener: (status: SyncStatus) => void) {
        this.statusListeners.push(listener);
        listener(this.currentStatus);
        return () => {
            this.statusListeners = this.statusListeners.filter(l => l !== listener);
        };
    }

    private updateStatus(newStatus: SyncStatus) {
        this.currentStatus = newStatus;
        this.statusListeners.forEach(listener => listener(newStatus));
    }

    private handleIncoming(data: string) {
        console.log('[EngineBridge] Received message:', data);
    }
}

// Export singleton instance
export const engineBridge = new EngineBridge();
