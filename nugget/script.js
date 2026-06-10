document.addEventListener('DOMContentLoaded', () => {
    const playerSelectionDiv = document.getElementById('player-selection');
    const numPlayersInput = document.getElementById('num-players');
    const startGameBtn = document.getElementById('start-game-btn');
    const gameAreaDiv = document.getElementById('game-area');
    const playersDiv = document.getElementById('players');
    const leversContainer = document.getElementById('levers-container');
    const messageDiv = document.getElementById('message');
    const resetRoundBtn = document.getElementById('reset-round-btn');
    const restartGameBtn = document.getElementById('restart-game-btn');

    let numPlayers = 0;
    let activePlayers = [];
    let playerOrder = [];
    let currentPlayerIndex = 0;
    let levers = [];
    let explosionLeverIndex = -1;
    let leversClickedThisRound = [];
    const playerImageMap = {
        1: 'img/miner_blue.gif',
        2: 'img/miner_red.gif',
        3: 'img/miner_green.gif',
        4: 'img/miner_yellow.gif'
    };
    const playerColors = ['blue', 'red', 'green', 'yellow'];
    const explosionSound = new Audio('audio/explosion.wav');
    const drumRollSound = new Audio('audio/drumroll.wav'); // Placeholder for drum roll
    const safeLeverSound = new Audio('audio/safelever.wav'); // Placeholder for safe lever sound
    const winSound = new Audio('audio/win.wav'); // Placeholder for win sound

    startGameBtn.addEventListener('click', () => {
        numPlayers = parseInt(numPlayersInput.value);
        if (numPlayers >= 2 && numPlayers <= 4) {
            playerSelectionDiv.style.display = 'none'; // Use style.display
            gameAreaDiv.classList.remove('hidden');
            initializeGame();
        } else {
            alert('Please select between 2 and 4 players.');
        }
    });

    resetRoundBtn.addEventListener('click', startNewRound);
    restartGameBtn.addEventListener('click', resetGame);

    function initializeGame() {
        activePlayers = Array.from({ length: numPlayers }, (_, i) => i + 1);
        createPlayerBlocks();
        playerOrder = shuffleArray([...activePlayers]);
        currentPlayerIndex = 0;
        moveCurrentPlayerDown();
        startNewRound();
        restartGameBtn.style.display = 'none'; // Initially hide restart button
    }

    function createPlayerBlocks() {
        playersDiv.innerHTML = '';
        const totalWidth = numPlayers * 120; // Adjust width for GIF spacing
        playersDiv.style.width = `${totalWidth}px`;
        playersDiv.style.height = '165px'; // Set height for the GIFs

        activePlayers.forEach((player, index) => {
            const playerContainer = document.createElement('div');
            playerContainer.classList.add('player-container');
            playerContainer.style.left = `${index * 120}px`; // Adjust spacing

            const playerBlock = document.createElement('div');
            playerBlock.classList.add('player');
            playerBlock.style.backgroundImage = `url('${playerImageMap[player]}')`;
            playerBlock.dataset.playerId = player;
            playerContainer.appendChild(playerBlock);
            playersDiv.appendChild(playerContainer);
        });
    }

    function startNewRound() {
        leversContainer.innerHTML = '';
        levers = Array.from({ length: activePlayers.length + 1 }, (_, i) => i);
        explosionLeverIndex = Math.floor(Math.random() * levers.length);
        playerOrder = shuffleArray([...activePlayers]);
        currentPlayerIndex = 0;
        updateMessage();
        leversClickedThisRound = [];
        resetRoundBtn.style.display = 'none'; // Use style.display
        resetPlayerPositions();
        moveCurrentPlayerDown();
        createLevers();
    }

    function resetPlayerPositions() {
        const playerContainers = document.querySelectorAll('.player-container');
        const totalWidth = activePlayers.length * 120;
        const playerSpacing = 120;

        playerContainers.forEach((container, index) => {
            container.style.bottom = '0';
            container.style.transform = 'translateY(0)';
            container.style.left = `${index * playerSpacing}px`;
        });
    }

    function moveCurrentPlayerDown() {
        const currentPlayerId = playerOrder[currentPlayerIndex];
        const currentPlayerContainer = document.querySelector(`.player-container[style*="left: ${activePlayers.indexOf(currentPlayerId) * 120}px"]`);
        if (currentPlayerContainer) {
            currentPlayerContainer.style.transform = 'translateY(20px)';
        }
    }

    function createLevers() {
        levers.forEach(index => {
            const leverButton = document.createElement('button');
            leverButton.classList.add('lever');
            leverButton.textContent = `Lever ${index + 1}`;
            leverButton.dataset.leverIndex = index;
            leverButton.addEventListener('click', handleLeverClick);
            leversContainer.appendChild(leverButton);
        });
    }

    function handleLeverClick(event) {
        const clickedLeverIndex = parseInt(event.target.dataset.leverIndex);
        const currentPlayer = playerOrder[currentPlayerIndex];
        event.target.disabled = true;
        leversClickedThisRound.push(clickedLeverIndex);
        resetPlayerPositions();

        if (drumRollSound) {
            drumRollSound.play();
        }

        setTimeout(() => {
            if (clickedLeverIndex === explosionLeverIndex) {
                messageDiv.textContent = `BOOM! ${getPlayerColorName(currentPlayer)} triggered the explosion!`;
                if (explosionSound) {
                    explosionSound.play();
                }
                explodePlayer(currentPlayer);
                endRound();
            } else {
                messageDiv.textContent = `${getPlayerColorName(currentPlayer)} pulled Lever ${clickedLeverIndex + 1}. Safe!`;
                if (safeLeverSound) {
                    safeLeverSound.play();
                }
                moveToNextPlayer();
            }
        }, 1500);
    }

    function moveToNextPlayer() {
        currentPlayerIndex++;
        if (currentPlayerIndex < playerOrder.length) {
            moveCurrentPlayerDown();
            updateMessage();
        } else {
            messageDiv.textContent = "All safe levers pulled! Resetting round.";
            document.querySelectorAll('.lever:not(:disabled)').forEach(lever => {
                lever.disabled = true;
            });
            setTimeout(startNewRound, 2000);
        }
    }

    function explodePlayer(playerId) {
        const explodedPlayerContainer = document.querySelector(`.player-container[style*="left: ${activePlayers.indexOf(playerId) * 120}px"] .player`);
        if (explodedPlayerContainer) {
            explodedPlayerContainer.classList.add('exploded');
        }
        activePlayers = activePlayers.filter(player => player !== playerId);
    }

    function endRound() {
        document.querySelectorAll('.lever:not(:disabled)').forEach(lever => {
            lever.disabled = true;
        });

        if (activePlayers.length === 1) {
            messageDiv.textContent = `${getPlayerColorName(activePlayers[0])} wins!`;
            if (winSound) {
                winSound.play();
            }
            restartGameBtn.style.display = 'block';
        } else {
            setTimeout(startNewRound, 2000);
        }
    }

    function getPlayerColorName(playerNumber) {
        switch (playerNumber) {
            case 1: return "Blue";
            case 2: return "Red";
            case 3: return "Green";
            case 4: return "Yellow";
            default: return `Player ${playerNumber}`;
        }
    }

    function updateMessage() {
        messageDiv.textContent = `Turn: ${getPlayerColorName(playerOrder[currentPlayerIndex])}`;
    }

    function resetGame() {
        playerSelectionDiv.style.display = 'block';
        gameAreaDiv.classList.add('hidden');
        restartGameBtn.style.display = 'none';
        messageDiv.textContent = "";
        playersDiv.innerHTML = "";
        leversContainer.innerHTML = "";
        numPlayersInput.value = 2;
        activePlayers = [];
        playerOrder = [];
        currentPlayerIndex = 0;
        levers = [];
        explosionLeverIndex = -1;
        leversClickedThisRound = [];
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
});