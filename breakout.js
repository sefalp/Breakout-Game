(function () {

    
    drawTable();
    
    const isStorage = 'undefined' !== typeof localStorage;

    

    var pausedGame = false;
    var startMenu = true;
    var gameOver = false;
    
    var gameLoop;
    var gameSpeed = 10;
    var ballMovementSpeed = 1;

    
    var highestScore = 1;
    var bestScores = [0,0,0];

    if(isStorage && localStorage.getItem('bestScores')){
        bestScores = localStorage.getItem('bestScores');
    }

    var bricks = [];
    var bricksMargin = 1;
    var bricksWidth = 0;
    var bricksHeight = 18;

    var lives = 3;
    var currentScore = 0;
    var level = [
        '**************',
        '**************',
        '**************',
        '**************'
    ];

    var ball = {

        width: 6,
        height: 6,
        left: 0,
        top: 0,
        speedLeft: 0,
        speedTop: 0

    };

    var paddle = {
        width: 100,
        height: 6,
        left: (document.getElementById('breakout').offsetWidth / 2) - 30,
        top: document.getElementById('breakout').offsetHeight - 40,
        speed: 0,
        maxSpeed: 10

    };
    

    


    function startGame () {
        
        gameStartMenu();
        scoreBoard();
        resetBall();
        buildLevel();
        createBricks();
        updateObjects();

    }


    function drawTable() {

        document.body.style.background = '#0E5CAD';
        document.body.style.font = '18px Orbitron';
        document.body.style.color = '#FFF';
        
        var breakout = document.createElement('div');
        var paddle = document.createElement('div');
        var ball = document.createElement('div');
        
        
        breakout.id = 'breakout';
        breakout.style.width = '800px';
        breakout.style.height = '600px';
        breakout.style.position = 'fixed';
        breakout.style.left = '50%';
        breakout.style.top = '50%';
        breakout.style.transform = 'translate(-50%, -50%)';
        breakout.style.background = '#000000';
        breakout.style.alignItems = "center";
        breakout.style.justifyContent = "center";
        
        paddle.id = 'paddle';
        paddle.style.background = '#E80505';
        paddle.style.position = 'absolute';
    
    
        ball.className = 'ball';
        ball.style.position = 'absolute';
        ball.style.background = '#FFF';
        ball.style.boxShadow = '0 15px 6px -1px rgba(0,0,0,.6)';
        ball.style.borderRadius = '50%';
        ball.style.zIndex = '9';
        
        breakout.appendChild(paddle);
        breakout.appendChild(ball);
  

        
        document.body.appendChild(breakout);

    }

    function pauseScreen(){

        var pauseScreen = document.createElement('div');

        pauseScreen.id = 'pauseScreen';
        pauseScreen.style.display = "flex";
        pauseScreen.style.width = '800px';
        pauseScreen.style.height = '600px';
        pauseScreen.style.position = 'absolute';
        pauseScreen.style.zIndex = 1000;
        pauseScreen.style.left = '50%';
        pauseScreen.style.top = '50%';
        pauseScreen.style.transform = 'translate(-50%, -50%)';
        pauseScreen.style.background = 'rgba(0,0,0,.3)';
        pauseScreen.style.alignItems = "center";
        pauseScreen.style.justifyContent = "center";

        var child = document.createTextNode("PAUSED");
       
        
        pauseScreen.appendChild(child);
        

        if(pausedGame){

        document.body.appendChild(pauseScreen);

        }
        
        if(!pausedGame){

         document.body.removeChild(document.getElementById('pauseScreen'))
            
        }  
    }

    function gameStartMenu(){

        var gameStartMenu = document.createElement('div');

        gameStartMenu.id = 'gameStartMenu';
        gameStartMenu.style.display = "flex";
        gameStartMenu.style.width = '800px';
        gameStartMenu.style.height = '600px';
        gameStartMenu.style.position = 'absolute';
        gameStartMenu.style.zIndex = 1000;
        gameStartMenu.style.left = '50%';
        gameStartMenu.style.top = '50%';
        gameStartMenu.style.transform = 'translate(-50%, -50%)';
        gameStartMenu.style.background = 'rgba(0,0,0)';
        gameStartMenu.style.alignItems = "center";
        gameStartMenu.style.justifyContent = "center";
        gameStartMenu.style.fontSize = "2rem";
        var child2 = document.createTextNode("PRESS 'SPACEBAR' TO START THE GAME");

        gameStartMenu.appendChild(child2);

        if(startMenu){

            document.body.appendChild(gameStartMenu);
    
        }
    }

    function gameOverScreen(){

        var gameOverScreen = document.createElement('div');

        gameOverScreen.id = 'gameOverScreen';
        gameOverScreen.style.display = "flex";
        gameOverScreen.style.width = '800px';
        gameOverScreen.style.height = '600px';
        gameOverScreen.style.position = 'absolute';
        gameOverScreen.style.zIndex = 1000;
        gameOverScreen.style.left = '50%';
        gameOverScreen.style.top = '50%';
        gameOverScreen.style.transform = 'translate(-50%, -50%)';
        gameOverScreen.style.background = 'rgba(0,0,0)';
        gameOverScreen.style.alignItems = "center";
        gameOverScreen.style.justifyContent = "center";
        gameOverScreen.style.fontSize = "2rem";


        var child3 = document.createTextNode("Gameover (Restarting...)");

        gameOverScreen.appendChild(child3);

        document.body.appendChild(gameOverScreen);

        gameOver = true;
        

        setTimeout(function(){ 

            document.body.removeChild(document.getElementById("gameOverScreen"));
            restartGame();

        }, 1000);

    }

    function scoreBoard(){

        var scoreBoard = document.createElement('div')
        
        scoreBoard.id = 'scoreBoard';
        scoreBoard.style.background = '#000000';
        scoreBoard.style.position = 'absolute';
        scoreBoard.style.left = '40%';
        scoreBoard.style.top = '2%';
        scoreBoard.style.boxShadow = '0 15px 6px -2px rgba(0,0,0,.6)';
        
        var child = document.createTextNode(currentScore >= highestScore ? `Highest Score! ${currentScore}` : `Score: ${currentScore}`);

        scoreBoard.appendChild(child);

        breakout.appendChild(scoreBoard);

    }
    
    function removeElement(element) {
        
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    function buildLevel () {

        var arena = document.getElementById('breakout');
    
        bricks = [];
    
        for (var row = 0; row < level.length; row ++) {
            for (var column = 0; column <= level[row].length; column ++) {
    
                if (!level[row][column] || level[row][column] === ' ') {
                    continue;
                }
    
                bricksWidth = (arena.offsetWidth - bricksMargin * 2) / level[row].length;
    
                bricks.push({
                    left: bricksMargin * 2 + (bricksWidth * column),
                    top: bricksHeight * row + 60,
                    width: bricksWidth - bricksMargin * 2,
                    height: bricksHeight - bricksMargin * 2,
                    removed : false
                });
            }
        }

    }

    function removeBricks () {
        document.querySelectorAll('.brick').forEach(function (brick) {
                removeElement(brick);
        });

    }

    function removeLives () {
        document.querySelectorAll('.lives').forEach(function (lives) {
                removeElement(lives);
        });

    }

    function createBricks () {

        removeBricks();
        var arena = document.getElementById('breakout');

        bricks.forEach(function (brick, index) {

            if(!brick.removed){

            var element = document.createElement('div');

            element.id = 'brick-' + index;
            element.className = 'brick';
            element.style.left = brick.left + 'px';
            element.style.top = brick.top + 'px';
            element.style.width = brick.width + 'px';
            element.style.height = brick.height + 'px';
            element.style.background = '#FFFFFF';
            element.style.position= 'absolute';
            element.style.boxShadow= '0 15px 20px 0px rgba(0,0,0,.4)';

            arena.appendChild(element)

            }
        });
    }

    function livesShow () {

        removeLives();
        var arena = document.getElementById('breakout');

        console.log(lives)

        for(var i=0 ; i< lives ; i++) {

            var element = document.createElement("img");
            element.src = "data:image/png;base64,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"
           
            element.className = 'lives';
            element.style.left = '10px';
            element.style.top = (i*20 + arena.offsetHeight/2) + 'px';
            element.style.width = "12" + 'px';
            element.style.height = "12" + 'px';
            element.style.position= 'absolute';
      

            arena.appendChild(element)

        };
    }

    function updateObjects () {

        document.getElementById('paddle').style.width = paddle.width + 'px';
        document.getElementById('paddle').style.height = paddle.height + 'px';
        document.getElementById('paddle').style.left = paddle.left + 'px';
        document.getElementById('paddle').style.top = paddle.top + 'px';

        document.querySelector('.ball').style.width = ball.width + 'px';
        document.querySelector('.ball').style.height = ball.height + 'px';
        document.querySelector('.ball').style.left = ball.left + 'px';
        document.querySelector('.ball').style.top = ball.top + 'px';

    }

    function resetBall () {

        livesShow();

        var arena = document.getElementById('breakout');

        ball.left = (arena.offsetWidth / 2) - (ball.width / 2);
        ball.top = (arena.offsetHeight / 1.6) - (ball.height / 2);
        ball.speedLeft = 1;
        ball.speedTop = ballMovementSpeed;
    
        if (Math.round(Math.random() * 1)) {
            ball.speedLeft = -ballMovementSpeed;
        }

        document.querySelector('.ball').style.left = ball.left + 'px';
        document.querySelector('.ball').style.top = ball.top + 'px';
    }

    function movePaddle (event) {

            var arena = document.getElementById('breakout');
            var arenaRect = arena.getBoundingClientRect();
            var arenaWidth = arena.offsetWidth;
            var mouseX = event.clientX - arenaRect.x;
            var halfOfPaddle = document.getElementById('paddle').offsetWidth / 2;
    
            if (mouseX <= halfOfPaddle) {
                mouseX = halfOfPaddle;
            }
    
            if (mouseX >= arenaWidth - halfOfPaddle) {
                mouseX = arenaWidth - halfOfPaddle;
            }
    
            paddle.left = mouseX - halfOfPaddle;   
    }

    function movePaddle2(way) {

        if(way === 1)
        {
            paddle.left -= paddle.maxSpeed;
        }
        else if(way === 2)
        {
            paddle.left += paddle.maxSpeed;
        }
        else if(way === 3)
        {
            paddle.speed = 0;
        }

    }

    function moveBall () {
        
        detectCollision();

        var arena = document.getElementById('breakout');
    
        ball.top += ball.speedTop;
        ball.left += ball.speedLeft;
    
        if (ball.left <= 0 || ball.left + ball.width >= arena.offsetWidth) {

            ball.speedLeft = -ball.speedLeft;

        }
    
        if (ball.top <= 0 || ball.top + ball.height >= arena.offsetHeight) {

            ball.speedTop = -ball.speedTop;

        }

        if (ball.top + ball.height >= arena.offsetHeight) {

            if(lives !== 1){
                lives -= 1
            }else{
                gameOverScreen();
            }

            resetBall();
        }
    }

    function detectCollision () {

        if (ball.top + ball.height >= paddle.top
         && ball.top + ball.height <= paddle.top + paddle.height
         && ball.left >= paddle.left
         && ball.left <= paddle.left + paddle.width
        ) {


            if(ball.speedTop/ball.speedLeft > 1){

            ball.speedLeft = Math.sign(ball.speedLeft) * Math.abs(ball.speedTop*(100/36))  

            }else{

            ball.speedTop = -(ball.speedTop + 0.3);

            }

        }
    
        for (var i = 0; i < bricks.length; i ++) {
            var brick = bricks[i];
    
            if (ball.top + ball.height >= brick.top
             && ball.top <= brick.top + brick.height
             && ball.left + ball.width >= brick.left
             && ball.left <= brick.left + brick.width
             && !brick.removed
            ) {

                ball.speedTop = -(ball.speedTop + 0.2);
                brick.removed =  true;
                currentScore = currentScore + 1; 
                if(currentScore > highestScore){
                    highestScore = currentScore;
                }
                scoreBoard();
                createBricks ();
                
                break;
            }
        }
    }


    function setEvents () {

        document.addEventListener('mousemove', function (event) {
            movePaddle(event);
        });

        document.addEventListener("keydown", event => {
            switch (event.key) {
                case "ArrowLeft":
                movePaddle2(1);
                break;
        
                case "ArrowRight":
                movePaddle2(2);
                break;

                case " ":
                    if(startMenu){
                        gameStart();
                    }else{
                        togglePause();
                    }
                break;

                default:
                    if(!startMenu || !gameOver){
                        togglePause();
                    }
                break;
                    
            }});

            document.addEventListener("keyup", event => {

                switch (event.key) {

                case "ArrowLeft":
                if (paddle.speed < 0) movePaddle2(3);
                break;
        
                case "ArrowRight":
                if (paddle.speed > 0) movePaddle2(3);
                break;

                default:

            }

            });

    }


    function togglePause(){
        if(pausedGame){

            pausedGame = false
            pauseScreen();

        }else{

            pausedGame = true
            pauseScreen();
        
        }
            
    }

    function gameStart(){
        startMenu = false;
        document.body.removeChild(document.getElementById('gameStartMenu'));
    }

    
    function restartGame(){
        
        lives = 3;
        currentScore = 0;
        ballMovementSpeed = 1;
        level = [
            '**************',
            '**************',
            '**************',
            '**************'
        ];
    
        ball = {
            width: 6,
            height: 6,
            left: 0,
            top: 0,
            speedLeft: 0,
            speedTop: 0
        };

        

        gameOver = false;
        startMenu = true;


        startGame();

    }

    function startGameLoop () {
        gameLoop = setInterval(function () {
            if(pausedGame || startMenu || gameOver){
                return
            }
            moveBall();
            updateObjects();
        }, gameSpeed);
    }

    setEvents();
    startGame();
    startGameLoop();

})();