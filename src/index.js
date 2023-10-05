import {SpaceX} from "./api/spacex";
import * as d3 from "d3";
import * as Geo from './geo.json'

document.addEventListener("DOMContentLoaded", setup)

let spaceX
let svg
let projection

function setup(){
    spaceX = new SpaceX();
    let ArrLaunchpads = spaceX.launchpads()
    spaceX.launches().then(data => {
        const listContainer = document.getElementById("listContainer")
        renderLaunches(data, listContainer);
    })
    drawMap(ArrLaunchpads)
    const listContainer = document.getElementById("listContainer")
    listContainer.addEventListener("mouseover", PointToRed)
}
function renderLaunches(launches, container){
    const list = document.createElement("ul");
    launches.forEach(launch=>{
        const item = document.createElement("li");
        item.innerHTML = launch.name;
        list.appendChild(item);
    })
    container.replaceChildren(list);
}

function drawMap(ArrLaunchpads){
    const width = 640
    const height = 480
    const margin = {top: 20, right: 10, bottom: 40, left: 100}
    svg = d3.select('#map').append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
       
    projection = d3.geoMercator()
        .scale(70)
        .center([0,20])
        .translate([width / 2 - margin.left, height / 2])        

    svg.append("g")
        .selectAll("path")
        .data(Geo.features)
        .enter()
        .append("path")
        .style("fill", "green")
        .attr("class", "topo")
        .attr("d", d3.geoPath()
            .projection(projection)
        ) 

    ArrLaunchpads.then(data => {
        data.forEach(Launchpad => {
            let x = Launchpad.longitude
            let y = Launchpad.latitude  
            let [xx, yy] = projection([x, y])
            svg.append("g")
                .append("circle")
                .attr("r", 2.5)
                .attr("cx", xx)
                .attr("cy", yy)
                .style("fill", "blue")
                .attr("class", "topo")
        })
    })
}

function PointToRed() {
    let elements = document.querySelectorAll('#listContainer li')
    elements.forEach(m=>{
        m.addEventListener("mouseover", MakeColor)
        m.addEventListener("mouseout", NoColor)
    })
    listContainer.removeEventListener("mouseover", PointToRed)
}

function MakeColor(Event){
    let Elem = Event.target
    Elem.style.backgroundColor = 'red';
    let text = Elem["innerText"]
    SwithPointColor(text,'red')
}
function NoColor(Event){
    let Elem = Event.target
    Elem.style.backgroundColor = 'white';
    let text = Elem["innerText"]
    SwithPointColor(text,'blue')
}

function SwithPointColor(text, color){
    spaceX.launches().then(data => {
        data.forEach(Launche => {
            if (Launche.name === text) {
                let launchpad_UUID = Launche.launchpad
                spaceX.launchpads().then(item => {
                    item.forEach(Launchpad => {
                        if (Launchpad.id === launchpad_UUID) {
                            
                            let x = Launchpad.longitude
                            let y = Launchpad.latitude  
                            
                            let [xx, yy] = projection([x, y])

                            svg.append("g")
                                .append("circle")
                                .attr("r", 2.5)
                                .attr("cx", xx)
                                .attr("cy", yy)
                                .style("fill", color)
                                .attr("class", "topo")
                        }
                    })
                }) 
            }
        })
    }) 
}