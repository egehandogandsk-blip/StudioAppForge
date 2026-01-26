import {
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Project {
    id: string;
    name: string;
    owner: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface CanvasObject {
    id: string;
    type: 'rect' | 'circle' | 'text' | 'path' | 'image';
    properties: {
        x: number;
        y: number;
        width?: number;
        height?: number;
        fill?: string;
        stroke?: string;
        strokeWidth?: number;
        text?: string;
        fontSize?: number;
        [key: string]: unknown;
    };
    layerId: string;
    zIndex: number;
}

// Project CRUD
export const createProject = async (name: string, owner: string): Promise<string> => {
    const projectRef = doc(collection(db, 'projects'));
    await setDoc(projectRef, {
        name,
        owner,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
    return projectRef.id;
};

export const getProject = async (projectId: string): Promise<Project | null> => {
    const docRef = doc(db, 'projects', projectId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Project;
    }
    return null;
};

export const updateProject = async (projectId: string, data: Partial<Project>) => {
    const docRef = doc(db, 'projects', projectId);
    await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
};

export const deleteProject = async (projectId: string) => {
    const docRef = doc(db, 'projects', projectId);
    await deleteDoc(docRef);
};

// Canvas Object CRUD
export const saveCanvasObject = async (projectId: string, object: CanvasObject) => {
    const objectRef = doc(db, 'projects', projectId, 'canvasObjects', object.id);
    await setDoc(objectRef, object);
};

export const deleteCanvasObject = async (projectId: string, objectId: string) => {
    const objectRef = doc(db, 'projects', projectId, 'canvasObjects', objectId);
    await deleteDoc(objectRef);
};

// Real-time listener for canvas objects
export const subscribeToCanvasObjects = (
    projectId: string,
    callback: (objects: CanvasObject[]) => void
) => {
    const objectsRef = collection(db, 'projects', projectId, 'canvasObjects');
    return onSnapshot(objectsRef, (snapshot) => {
        const objects = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CanvasObject));
        callback(objects);
    });
};
