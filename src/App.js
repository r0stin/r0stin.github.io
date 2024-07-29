import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import { Physics, usePlane, useBox } from '@react-three/cannon';
import { Camera } from 'lucide-react';

const Box = ({ position, size, color }) => {
  const [ref] = useBox(() => ({ mass: 1, position }));
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const Plane = ({ position, rotation }) => {
  const [ref] = usePlane(() => ({ rotation, position }));
  return (
    <mesh ref={ref} rotation={rotation} position={position}>
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial color="#f0f0f0" transparent opacity={0.2} />
    </mesh>
  );
};

const FloatingText = ({ text, position, color = "white" }) => {
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <Text
        color={color}
        fontSize={1.5}
        maxWidth={200}
        lineHeight={1}
        letterSpacing={0.02}
        textAlign="left"
        font="https://fonts.gstatic.com/s/raleway/v14/1Ptug8zYS_SKggPNyC0IT4ttDfA.woff2"
        anchorX="center"
        anchorY="middle"
        position={position}
      >
        {text}
      </Text>
    </Float>
  );
};

const Scene = () => {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 5, 15);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Physics>
        <Plane position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]} />
        <Box position={[-4, 0, 0]} size={[1, 1, 1]} color="hotpink" />
        <Box position={[0, 0, 0]} size={[1, 1, 1]} color="lightblue" />
        <Box position={[4, 0, 0]} size={[1, 1, 1]} color="lightgreen" />
      </Physics>
      <FloatingText text="Rostin Maafi" position={[0, 4, 0]} color="#ffd700" />
      <FloatingText text="Computer Science Student" position={[0, 2, 0]} />
      <FloatingText text="& Aspiring Developer" position={[0, 0, 0]} />
    </>
  );
};

const PortfolioSection = ({ title, content }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-bold text-yellow-400 mb-4">{title}</h2>
      {content}
    </div>
  );
};

const App = () => {
  const [showPortfolio, setShowPortfolio] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-grow relative">
        <Canvas>
          <OrbitControls enableZoom={false} />
          <Scene />
        </Canvas>
        <button
          className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-bold hover:bg-yellow-300 transition-colors"
          onClick={() => setShowPortfolio(!showPortfolio)}
        >
          {showPortfolio ? "Hide Portfolio" : "Show Portfolio"}
        </button>
      </div>
      {showPortfolio && (
        <div className="bg-gray-900 text-white p-8 overflow-auto h-1/2">
          <PortfolioSection
            title="About Me"
            content={
              <p>
                I'm a passionate computer science student at Queen's University, constantly exploring new technologies and pushing the boundaries of what's possible in the digital realm. With a keen interest in AI, machine learning, and web development, I'm always eager to take on new challenges and create innovative solutions.
              </p>
            }
          />
          <PortfolioSection
            title="Skills"
            content={
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Python", "Java", "C++", "JavaScript", "React", "Node.js", "SQL", "Git"].map((skill) => (
                  <div key={skill} className="bg-gray-700 p-2 rounded text-center">
                    {skill}
                  </div>
                ))}
              </div>
            }
          />
          <PortfolioSection
            title="Projects"
            content={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: "AI Chatbot", description: "An intelligent chatbot powered by machine learning algorithms.", icon: "💬" },
                  { title: "E-commerce Platform", description: "A full-stack web application for online shopping experiences.", icon: "🛒" },
                  { title: "Mobile Fitness Tracker", description: "An iOS app for tracking workouts and health metrics.", icon: "🏋️‍♂️" },
                ].map((project) => (
                  <div key={project.title} className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-4xl mb-2">{project.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                    <p>{project.description}</p>
                  </div>
                ))}
              </div>
            }
          />
        </div>
      )}
    </div>
  );
};

export default App;
