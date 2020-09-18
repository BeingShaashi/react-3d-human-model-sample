import React, { Component } from 'react';
import jQuery from 'jquery';
import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';
import FBXLoader from 'three-fbxloader-offical';

// import manFile from "../assets/models/freeMan.FBX";
import manFile from "../assets/models/manFree0.FBX";
import '../assets/styles/home.css';

export default class WelcomePage extends Component {
  constructor(props) {
    super(props);
    this.cWidth = jQuery(window).width();  this.mouseX = 0;
    this.cHeight = jQuery(window).height();this.mouseY = 0;
    this.animate = this.animate.bind(this);
    this.mainHeight = 1.8; this.mainWeight = 70;
    this.state = {height:1.8, weight:70, chest:1, waist:1};
  }
  
  componentDidMount() {
    this.setCanvasSize();
    this.init();
    this.animate();
  }

  setCanvasSize = () => {
    this.cWidth = jQuery(window).width();
    this.cHeight = jQuery(window).height();
    if (this.renderer && this.camera) {
      this.renderer.setSize(this.cWidth, this.cHeight);
      this.camera.aspect = this.cWidth/this.cHeight;
      this.camera.updateProjectionMatrix();
    }
  }

  changeValue =(e, type) => {
    const inputVal = parseFloat(e.target.value)
    this.setState({[type]:inputVal});
    if (this.manModel) {
      if (type === "height") {
        const scl = inputVal / this.mainHeight;
        this.manModel.scale.y = scl;
      }
      else if (type === "weight") {
        const scl = inputVal / this.mainWeight;
        this.manModel.scale.x = (scl + 1) / 2;
        this.manModel.scale.z = scl;
      }
      else if (type === "chest") {
        this.chest.scale.x = this.chest.scale.z = inputVal;
      }
      else if (type === "waist") {
        this.waist.scale.x = this.waist.scale.z = inputVal;
        this.waist.children.forEach(child => {
          if (child.name !== "spine") child.scale.x = child.scale.z = 1 / inputVal;
          else {
            child.children[0].scale.x = child.scale.z = 1 / inputVal;
          }
        });
      }
    }
  }

  init() {
    this.renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
    this.renderer.setSize(this.cWidth, this.cHeight);
    if (!document.getElementById("container")) return false;
    document.getElementById("container").appendChild(this.renderer.domElement);
    this.renderer.setClearColor(0x000000, 0);

    this.camera = new THREE.PerspectiveCamera(60, this.cWidth / this.cHeight, 0.1,  50);
    this.camera.position.set(-2, 0.5, 2);
    this.scene = new THREE.Scene();
    this.totalGroup = new THREE.Group(); this.scene.add(this.totalGroup); this.totalGroup.position.y = this.mainHeight / -2;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement); // this.controls.enabled = false;

    const ambientLight = new THREE.AmbientLight( 0xFFFFFF, 0.5 ); this.scene.add( ambientLight );
    this.mainLight = new THREE.DirectionalLight( 0xFFFFFF, 0.5 ); this.scene.add( this.mainLight );
    this.mainLight.position.set(0, 0, 100);
    this.loadPlane();
    this.loadModel();
  }

  loadPlane(){
    const planeGeo = new THREE.BoxGeometry(10, 0.01, 10);
    const planeMat = new THREE.MeshPhongMaterial({color:0xAAAAAA});
    const planeMesh = new THREE.Mesh(planeGeo, planeMat);
    this.totalGroup.add(planeMesh);
  }
  
  loadModel() {
    var self = this;
    new FBXLoader().load(manFile, function (object){
      var vSize = new THREE.Box3().setFromObject(object).getSize();
      var scl = self.mainHeight/vSize.y;
      object.scale.set(scl, scl, scl);
      object.traverse(function(child)  {
        console.log("\n object properties",child);

        if    (child.name === "chest") self.chest = child;
        else if (child.name === "hips") self.waist = child;
        if (child instanceof THREE.Mesh) {
          child.material.side = THREE.DoubleSide;
        }
      })
      self.manModel = new THREE.Group();self.manModel.add(object);
      
      self.totalGroup.add(self.manModel);
      self.setLoading();
    })
  }

  animate () {
    if (!this.camera || !this.scene) return;
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  }
  
  render() {
    return (
      <div className="home">
        <div id="container"></div>
        <div className="setting">
          <div className="set-item">
            <label>Height {this.state.height} m</label>
            <input type="range" min="1.5" max="2.0" step="0.01" value={this.state.height} onChange={(e)=>this.changeValue(e, "height")}></input>
          </div>
          <div className="set-item">
            <label>Weight  {this.state.weight} Kg</label>
            <input type="range" min="50" max="100" step="1" value={this.state.weight} onChange={(e)=>this.changeValue(e, "weight")}></input>
          </div>
          <div className="set-item">
            <label>Chest {this.state.chest} </label>
            <input type="range" min="0.5" max="1.5" step="0.01" value={this.state.chest} onChange={(e)=>this.changeValue(e, "chest")}></input>
          </div>
          <div className="set-item">
            <label>Waist {this.state.waist} </label>
            <input type="range" min="0.5" max="1.5" step="0.01" value={this.state.waist} onChange={(e)=>this.changeValue(e, "waist")}></input>
          </div>
        </div>
      </div>
    )
  }
}
