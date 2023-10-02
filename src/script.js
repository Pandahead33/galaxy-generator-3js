import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Galaxy
const parameters = {
    count: 100000,
    size: 0.01,
    radius: 5,
    branches: 5,
    spin: -2,
    randomness: 0.2,
    randomnessPower: 3,
    insideColor: '#ff6030',
    outsideColor: '#1b3984'
}

let galaxyGeometry = null
let particleMaterial = null
let galaxy = null

const generateGalaxy = () => {
    if(galaxy !== null) {
        galaxyGeometry.dispose()
        particleMaterial.dispose()
        scene.remove(galaxy)
    }

    galaxyGeometry = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    for (let positionIndex = 0; positionIndex < parameters.count; positionIndex+=3) {
        const currentPoint = positionIndex / 3;
        const currentPositionXIndex = positionIndex;
        const currentPositionYIndex = positionIndex + 1;
        const currentPositionZIndex = positionIndex + 2;

        const galaxyRadius = Math.random() * parameters.radius
        const spinAngle = galaxyRadius * parameters.spin
        const branchAngle = (currentPoint % parameters.branches) / parameters.branches * Math.PI * 2

        const xRandomness = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * galaxyRadius
        const yRandomness = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * galaxyRadius
        const zRandomness =Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * galaxyRadius

        particlePositions[currentPositionXIndex] = Math.cos(branchAngle + spinAngle) * galaxyRadius + xRandomness
        particlePositions[currentPositionYIndex] = 0 + yRandomness
        particlePositions[currentPositionZIndex] = Math.sin(branchAngle + spinAngle) * galaxyRadius + zRandomness

        const colorInside = new THREE.Color(parameters.insideColor)
        const colorOutside = new THREE.Color(parameters.outsideColor)
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, galaxyRadius / parameters.radius)

        colors[currentPositionXIndex] = mixedColor.r
        colors[currentPositionYIndex] = mixedColor.g
        colors[currentPositionZIndex] = mixedColor.b
    }

    galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    particleMaterial = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })

    galaxy = new THREE.Points(galaxyGeometry, particleMaterial)
    scene.add(galaxy)
}

gui.add(parameters, 'count')
    .min(100)
    .max(1000000)
    .step(100)
    .onFinishChange(generateGalaxy)

gui.add(parameters, 'size')
    .min(0.001)
    .max(0.1)
    .step(0.001)
    .onFinishChange(generateGalaxy)

gui.add(parameters, 'radius')
    .min(.01)
    .max(20)
    .step(0.01)
    .onFinishChange(generateGalaxy)

gui.add(parameters, 'branches')
    .min(2)
    .max(20)
    .step(1)
    .onFinishChange(generateGalaxy)

gui.add(parameters, 'spin')
    .min(-5)
    .max(5)
    .step(0.001)
    .onFinishChange(generateGalaxy)

gui.add(parameters, 'randomness')
    .min(0)
    .max(2)
    .step(0.001)
    .onFinishChange(generateGalaxy)

gui.add(parameters, 'randomnessPower')
    .min(1)
    .max(10)
    .step(0.001)
    .onFinishChange(generateGalaxy)

gui.addColor(parameters, 'insideColor')
    .onFinishChange(generateGalaxy)

gui.addColor(parameters, 'outsideColor')
    .onFinishChange(generateGalaxy)

generateGalaxy()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
