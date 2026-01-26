export interface CanvasSession {
    id: string;
    ownerId: string;
    name: string;
    createdAt: number;
    lastModifiedAt: number;
    objects: Record<string, any>;
    collaborators: string[];
}

export interface CanvasObject {
    id: string;
    type: string;
    data: any;
    createdBy: string;
    updatedAt: number;
}

export interface UserCursor {
    userId: string;
    x: number;
    y: number;
    name: string;
    color: string;
    lastSeen: number;
}

export interface ActiveUser {
    userId: string;
    displayName: string;
    photoURL?: string;
    joinedAt: number;
    lastSeen: number;
}
