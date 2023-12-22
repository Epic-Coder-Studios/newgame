//canvas stuff
const canvas = document.querySelector("canvas")
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const scoreEl = document.querySelector('#scoreEl')
const startBtn = document.querySelector('#startButton')
const menuBtn = document.querySelector('#menuButton')
const modal = document.querySelector('#menu')
const dedModal = document.querySelector('#dead')
const bigScore = document.querySelector('#big-score')

const speed = 5
const friction = 0.97

const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x, y, 10, 'white')
let projectiles = []
let enemies = []
let particles = []
let anmationId
let score = 0


function init (){
    particles = []
    player = new Player(x, y, 10, 'white')
    projectiles = []
    enemies = []
    score = 0
    scoreEl.innerHTML = score
    bigScore.innerHTML = score
    bleep = new Sound('bleep.mp3')
    track = new Sound('track.mp3',0.2)
    
    track.start()
}


function spawnEnemies(){
     setInterval(() =>{
        const radius = Math.random() * (30 - 10) + 10

        let x
        let y 

        if (Math.random < 0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        } else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }

        const color = `hsl(${Math.random() * 360},50%,50%)`

        const angle = Math.atan2(
            canvas.height / 2 - y,
            canvas.width / 2 - x 
        )
        const velocity = {
            x:Math.cos(angle),
            y:Math.sin(angle)
        }
        enemies.push(new Enemy(x,y,radius,color,velocity))
    },1000)
}

const projectile = new Projectile(
    canvas.width / 2,
    canvas.height / 2,
    5,
    'white',
    {
        x:1,
        y:1
    })


function animate (){
    
    animationId = requestAnimationFrame(animate)
    //color background lol
    c.fillStyle = 'rgba(0,0,0,0.1)'
    c.fillRect(0, 0, canvas.width,canvas.height)
    player.draw()
    particles.forEach((particle, index) =>{
        if(particle.alpha <= 0){
            particles.splice(index, 1)
        }else{
           particle.update() 
        }
        
    })
    projectiles.forEach((projectile, index) =>{
        projectile.update()
        
        //remove from edge of screen
        if(projectile.x + projectile.radius < 0 ||
           projectile.x - projectile.radius > canvas.width ||
           projectile.y + projectile.radius < 0 ||
           projectile.y - projectile.radius > canvas.height){
            setTimeout(() =>{
                projectiles.splice(index, 1)
            }, 0)
        }
    })
    enemies.forEach((enemy,index) => {
        //run enemies for each one
        enemy.update()
        const dist = Math.hypot(
            player.x - enemy.x,
            player.y - enemy.y
            )

        if (dist - enemy.radius - player.radius< 1){
            console.log("rip bozo")
            explode = new Sound('explode.mp3')
            explode.start()
            cancelAnimationFrame(animationId)
            dedModal.style.display = 'flex'
            bigScore.innerHTML = score
            track.stop()
        }        
            
        projectiles.forEach((projectile,projectileIndex) =>{
            //calculate distance
            const dist = Math.hypot(
                projectile.x - enemy.x,
                projectile.y - enemy.y
                )
            //if collide    
            if (dist - enemy.radius - projectile.radius< 1){
                explode = new Sound('explode.mp3')
                explode.start()
                //create explosion
                for (let i = 0; i < enemy.radius * 2; i++){
                    particles.push(new Particle(
                        projectile.x,
                        projectile.y,
                        Math.random() * 2,
                        enemy.color,{
                        x: (Math.random() - 0.5) * (Math.random() * 8),
                        y: (Math.random() - 0.5) * (Math.random() * 8)
                    }))
                    
                }
                if (enemy.radius - 10 > 10){
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    projectiles.splice(projectileIndex, 1)
                }else{
                    score += 100
                    scoreEl.innerHTML = score
                    console.log(score)
                    setTimeout(() =>{
                        
                        enemies.splice(index, 1)
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                }
            }
        })
    })
}


