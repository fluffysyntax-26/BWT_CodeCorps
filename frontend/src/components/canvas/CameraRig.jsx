import { useFrame, useThree } from '@react-three/fiber';
import { useLocation } from 'react-router-dom';
import * as THREE from 'three';
import { useEffect, useRef } from 'react';

const CameraRig = () => {
    const { camera } = useThree();
    const location = useLocation();
    const targetPosition = useRef(new THREE.Vector3(0, 0, 1));

    useEffect(() => {
        switch (location.pathname) {
            case '/':
                targetPosition.current.set(0, 0, 1); // Default view
                break;
            case '/dashboard':
                targetPosition.current.set(50, 20, 50); // Shift significantly
                break;
            case '/profile':
                targetPosition.current.set(20, 0, 30); // Zoom in slightly
                break;
            case '/expenses':
                targetPosition.current.set(50, -20, 50); // Shift down right
                break;
            case '/decisions':
                targetPosition.current.set(0, 50, 50); // Shift up
                break;
            case '/chat':
                targetPosition.current.set(-50, -20, 50); // Shift left
                break;
            default:
                targetPosition.current.set(0, 0, 1);
        }
    }, [location]);

    useFrame((state, delta) => {
        // Smoothly interpolate camera position
        state.camera.position.lerp(targetPosition.current, 2 * delta);
        // Ensure camera always looks at center
        state.camera.lookAt(0, 0, 0);
    });

    return null;
};

export default CameraRig;
