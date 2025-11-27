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
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
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
            const envMap = texture;
            
            this.scene.environment = envMap;
    
        } );
    }
    
    initScene(){
        this.loadGLTF( 'knight' );
    }
    
    set action(name){
		if (this.actionName == name) return;
		
		const clip = this.animations[name];
		
        if (clip!==undefined){
			const action = this.mixer.clipAction( clip );
            
            if (name=='Die'){
                action.loop = THREE.LoopOnce;
                action.clampWhenFinished = true;
            }
            
			this.actionName = name;
			if (this.curAction) this.curAction.crossFadeTo(action, 0.5);
            
            action.enabled = true;
			action.play();
            
            this.curAction = action;
		}
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
        const loader = new GLTFLoader( ).setPath( '../../assets/');
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
                self.animations = {};
                
                gltf.animations.forEach( (anim)=>{
                    if (anim.name == 'Look Around'){
                        anim.name = 'Idle';
                    }else if (anim.name == 'Walking'){
                        anim.name = 'Walk';
                    }
                    self.animations[anim.name] = anim;
                })
                
                self.addButtonEvents();
                
                self.knight = gltf.scene;

                gltf.scene.children[1].visible = false;
                
                self.mixer = new THREE.AnimationMixer( self.knight )
                
                self.scene.add( self.knight );
                
                self.loadingBar.visible = false;
                
                //const scale = 0.01;
				//self.knight.scale.set(scale, scale, scale); 
                self.action = "Idle";
                
                self.renderer.setAnimationLoop( self.render.bind(self) );
			},
			// called while loading is progressing
			function ( xhr ) {

				self.loadingBar.progress = (xhr.loaded / xhr.total);
				
			},
			// called when loading has errors
			function ( error ) {

				console.log( 'An error happened' );

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
        this.mixer.update( dt )
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };