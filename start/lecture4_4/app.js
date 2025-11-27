import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { LoadingBar } from '../../libs/LoadingBar.js';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


class App{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
        this.clock = new THREE.Clock();
        
		this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );
		this.camera.position.set( 0, 1.6, 3 );
        this.camera.lookAt( 0, 0, 0 );
        
		this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x505050 );

		this.scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );

        const light = new THREE.DirectionalLight( 0xffffff, 3 );
        light.position.set( 1, 1, 1 ).normalize();
		this.scene.add( light );
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.setEnvironment();
        
		container.appendChild( this.renderer.domElement );
        
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.target.set(0, 1, 0);
        this.controls.update();
        
        this.stats = new Stats();
        document.body.appendChild( this.stats.dom );
        
        this.loadingBar = new LoadingBar();
        this.initScene();
        
        window.addEventListener('resize', this.resize.bind(this) );
	}	
    
    setEnvironment(){
        const loader = new RGBELoader().setPath( '../../assets/' )
        loader.load( 'hdr/venice_sunset_1k.hdr', ( texture ) => {
    
            texture.mapping = THREE.EquirectangularReflectionMapping;
            this.scene.environment = texture;
        
        } );
    }
    
    initScene(){
        this.loadGLTF( 'knight' );
    }
    
    addButtonEvents(){
        const self = this;
        
        function onClick(){
            self.action = this.innerHTML;    
        }
        
        for(let i=1; i<=4; i++){
            const btn = document.getElementById(`btn${i}`);
            btn.addEventListener( 'click', onClick );
        }    
    }
    
    loadGLTF(filename){
        const loader = new GLTFLoader( ).setPath( '../../assets/' );
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( '../../node_modules/three/examples/jsm/libs/draco/' );
        loader.setDRACOLoader( dracoLoader );
        
        const self = this;
		
		// Load a glTF resource
		loader.load(
			// resource URL
			`${filename}.glb`,
			// called when the resource is loaded
			function ( gltf ) {
                
                self.renderer.setAnimationLoop( self.render.bind(self) );
			},
			// called while loading is progressing
			function ( xhr ) {

				self.loadingBar.progress = (xhr.loaded / xhr.total);
				
			},
			// called when loading has errors
			function ( error ) {

				console.error( error.message );

			}  
        );
    }
    
    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
    
	render( ) {   
        const dt = this.clock.getDelta();
        this.stats.update();
        if (this.mixer) this.mixer.update( dt )
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };