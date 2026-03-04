import { Canvas, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, OrbitControls } from '@react-three/drei';
import { useEffect, useState } from 'react';

const ResponsiveSphere = () => {
    const { viewport } = useThree();
    const [scale, setScale] = useState(1.8);

    useEffect(() => {
        // Adjust scale based on viewport width
        if (viewport.width < 5) {
            setScale(1.2);
        } else if (viewport.width < 10) {
            setScale(1.5);
        } else {
            setScale(1.8);
        }
    }, [viewport.width]);

    return (
        <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
            <Sphere args={[1, 100, 200]} scale={scale}>
                <MeshDistortMaterial
                    color="#3b82f6" // Finance Blue
                    attach="material"
                    distort={0.4}
                    speed={2}
                />
            </Sphere>
        </Float>
    );
};

const FinancialHero = () => {
    return (
        <div className="h-[300px] md:h-[500px] w-full">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <ResponsiveSphere />
                <OrbitControls enableZoom={false} />
            </Canvas>
        </div>
    );
};

export default FinancialHero;
