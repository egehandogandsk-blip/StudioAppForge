import {
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    onSnapshot,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { CanvasSession, UserCursor, ActiveUser } from '../models/CanvasSession';
import { v4 as uuidv4 } from 'uuid';

const CANVASES_COLLECTION = 'canvases';

/**
 * Create a new canvas session
 */
export const createCanvasSession = async (
    userId: string,
    userName: string
): Promise<string> => {
    const sessionId = uuidv4();
    const canvasRef = doc(db, CANVASES_COLLECTION, sessionId);

    const session: Omit<CanvasSession, 'createdAt' | 'lastModifiedAt'> & {
        createdAt: any;
        lastModifiedAt: any;
    } = {
        id: sessionId,
        ownerId: userId,
        name: 'Untitled Canvas',
        createdAt: serverTimestamp(),
        lastModifiedAt: serverTimestamp(),
        objects: {},
        collaborators: [userId],
    };

    await setDoc(canvasRef, session);

    // Add initial presence
    await updateUserPresence(sessionId, userId, userName);

    return sessionId;
};

/**
 * Get canvas session by ID
 */
export const getCanvasSession = async (sessionId: string): Promise<CanvasSession | null> => {
    const canvasRef = doc(db, CANVASES_COLLECTION, sessionId);
    const snapshot = await getDoc(canvasRef);

    if (!snapshot.exists()) {
        return null;
    }

    const data = snapshot.data();
    return {
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toMillis() || Date.now(),
        lastModifiedAt: (data.lastModifiedAt as Timestamp)?.toMillis() || Date.now(),
    } as CanvasSession;
};

/**
 * Subscribe to canvas changes
 */
export const subscribeToCanvas = (
    sessionId: string,
    onUpdate: (session: CanvasSession) => void,
    onError?: (error: Error) => void
): (() => void) => {
    const canvasRef = doc(db, CANVASES_COLLECTION, sessionId);

    return onSnapshot(
        canvasRef,
        (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                onUpdate({
                    ...data,
                    createdAt: (data.createdAt as Timestamp)?.toMillis() || Date.now(),
                    lastModifiedAt: (data.lastModifiedAt as Timestamp)?.toMillis() || Date.now(),
                } as CanvasSession);
            }
        },
        (error) => {
            console.error('Firestore subscription error:', error);
            onError?.(error);
        }
    );
};

/**
 * Update canvas objects
 */
export const updateCanvasObjects = async (
    sessionId: string,
    objects: Record<string, any>
): Promise<void> => {
    const canvasRef = doc(db, CANVASES_COLLECTION, sessionId);

    await updateDoc(canvasRef, {
        objects,
        lastModifiedAt: serverTimestamp(),
    });
};

/**
 * Update user presence
 */
export const updateUserPresence = async (
    sessionId: string,
    userId: string,
    displayName: string,
    photoURL?: string
): Promise<void> => {
    const presenceRef = doc(db, CANVASES_COLLECTION, sessionId, 'presence', userId);

    const presence: Omit<ActiveUser, 'joinedAt' | 'lastSeen'> & {
        joinedAt: any;
        lastSeen: any;
    } = {
        userId,
        displayName,
        photoURL,
        joinedAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
    };

    await setDoc(presenceRef, presence, { merge: true });
};

/**
 * Update user cursor position
 */
export const updateUserCursor = async (
    sessionId: string,
    cursor: UserCursor
): Promise<void> => {
    const cursorRef = doc(db, CANVASES_COLLECTION, sessionId, 'cursors', cursor.userId);

    await setDoc(cursorRef, {
        ...cursor,
        lastSeen: serverTimestamp(),
    });
};

/**
 * Subscribe to active users
 */
export const subscribeToActiveUsers = (
    sessionId: string,
    onUpdate: (users: ActiveUser[]) => void
): (() => void) => {
    const presenceCollection = collection(db, CANVASES_COLLECTION, sessionId, 'presence');

    return onSnapshot(presenceCollection, (snapshot) => {
        const users: ActiveUser[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                joinedAt: (data.joinedAt as Timestamp)?.toMillis() || Date.now(),
                lastSeen: (data.lastSeen as Timestamp)?.toMillis() || Date.now(),
            } as ActiveUser;
        });

        // Filter out inactive users (not seen in last 30 seconds)
        const activeUsers = users.filter(u => Date.now() - u.lastSeen < 30000);
        onUpdate(activeUsers);
    });
};

/**
 * Subscribe to user cursors
 */
export const subscribeToUserCursors = (
    sessionId: string,
    onUpdate: (cursors: UserCursor[]) => void
): (() => void) => {
    const cursorsCollection = collection(db, CANVASES_COLLECTION, sessionId, 'cursors');

    return onSnapshot(cursorsCollection, (snapshot) => {
        const cursors: UserCursor[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                lastSeen: (data.lastSeen as Timestamp)?.toMillis() || Date.now(),
            } as UserCursor;
        });

        // Filter out old cursors
        const activeCursors = cursors.filter(c => Date.now() - c.lastSeen < 5000);
        onUpdate(activeCursors);
    });
};
