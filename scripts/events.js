canvas.addEventListener('click', (event) => {
    // console.log(projectiles)
    const angle = Math.atan2(
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2
        )
    const velocity = {
        x:Math.cos(angle) * speed,
        y:Math.sin(angle) * speed
    }
    // console.log(angle)
    projectiles.push(new Projectile(
        canvas.width / 2,
        canvas.height / 2,
        5,
        'white',
        velocity
        
    ))
    shoot = new Sound('shoot.mp3')
    shoot.start()

})

startBtn.addEventListener('click',() => {
    
    init()
    animate()
    spawnEnemies()
    modal.style.display = 'none'
    bleep.start()
    
})