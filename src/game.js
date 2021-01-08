// <reference path="htp://code.createjs.com/createjs-2013.12.12.min.js" />
/// <reference path="../../../Content/GamesDownloadTemplate/lib/ScormHelper.js" />
var Game = Game || (function (createjs) {

    function Game(canvas, gameData) {
        var self = this;
        self.gameData = gameData;
        self.stage = new createjs.Stage(canvas);
        createjs.Touch.enable(self, false, true);
        self.stage.enableMouseOver(10);

        //stage.addChild(game);
        //game.start();

        createjs.Ticker.addEventListener("tick", handleTick);
        function handleTick(event) {
            self.stage.update();
        }

        // ***********     Declare all assests and preload them. *************
        //var assetsPath = gameData.assetsPath + "Assets/" || "Assets/";

        var assetsPath = gameData.assetsPath || "";

        assetsPath += "Assets/";

        var assets = [
            { id: "gamescreen", src: assetsPath + "matchgameBackground8x6.png" },
            { id: "restart_button", src: assetsPath + "greenButtonOutline.png" },
            { id: "card", src: assetsPath + "_cardBack.png" },
            { id: "cardFace", src: assetsPath + "_cardFace.png" },
            { id: "clockBack", src: assetsPath + "clockBack.png" },
            { id: "clockHand", src: assetsPath + "clockHand.png" },
            { id: "intro", src: assetsPath + "mechanical-2_01.mp3" },
            { id: "memoryBG", src: assetsPath + "MemoryBG.png" },
            { id: "buttonClick", src: assetsPath + "click.mp3" },
            { id: "gameOver", src: assetsPath + "GameOver.mp3" },
            { id: "success", src: assetsPath + "complete_success.wav" },
            { id: "matchFound", src: assetsPath + "goodTone.mp3" },
            { id: "memoryMatchLarge", src: assetsPath + "MemoryMatchText2.png" },
            { id: "panel", src: assetsPath + "openingInstructionPanel.png" },
            { id: "closePanel", src: assetsPath + "matchingGameFeedbackBox.png" },
            { id: "startbutton", src: assetsPath + "roundStartButton.png" },
            { id: "60sec", src: assetsPath + "60Button.png" },
            { id: "90sec", src: assetsPath + "90Button.png" },
            { id: "120sec", src: assetsPath + "120Button.png" },
            { id: "5min", src: assetsPath + "5MinButton.png" },
            { id: "levelup", src: assetsPath + "level-up.mp3" }
        ];

       

        var stageBG = new createjs.Shape();
        stageBG.name = "stageBG";
        //stageBG.graphics.setStrokeStyle(3).beginStroke("black").beginFill("silver").drawRect(0, 0, 800, 600).endStroke().endFill();
        self.stage.addChild(stageBG);
        self.stage.mouseMoveOutside = true; // keep tracking the mouse even outside the canvas


        // SCORM LMS ******************
        var isLmsConnected = false;
        var currentLmsInteraction = null;
        if (typeof ScormHelper !== 'undefined') {
            isLmsConnected = ScormHelper.initialize();
        }

        var quit;

        if (isLmsConnected) {
            quit = function () {
                ScormHelper.cmi.exit("");
                ScormHelper.adl.nav.request("exitAll");
                ScormHelper.terminate();
            }
        }
        else {
            quit = function () {
                window.location = "http://www.wisc-online.com";
            }
        }
        //**************************** end SCORM LMS

        //set up arrays of elements
        var originalOrdedList = [];
        var correctlySortedSubset = [];
        var randomTermsForUserSorting = [];


        //NEW Loop to include definitions
        for (var d = 0; d < gameData.Terms.length; d++) {
            gameData.Terms[d].OrderId = d;

        }

        trim(gameData.Terms);
        function trim(array) {
            var arrayLength = array.length;
            
         //   var tempArray = array;
            while (array.length > 6) {   // was 12. had 12 terms changed to 6 terms each including a word and a definition ********
                                                
                var ri = Math.floor(Math.random() * array.length);
                array.splice(ri, 1);
                                               
                arrayLength = array.length; // new trimmed length
            }


            var currentIndex = array.length, temporaryValue, randomIndex;

            // While there remain elements to shuffle...
            while (0 !== currentIndex) {

                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }
            return array;
        }


        var queue = new createjs.LoadQueue(false);
        queue.installPlugin(createjs.Sound);
        queue.addEventListener("complete", function (event) {
            showView(introductionScreen());
        });
        queue.loadManifest(assets);
        function showView(_view) {
            try {
                if (self.currentView) {
                    self.previousView = self.currentView;
                    self.stage.removeChild(self.currentView);
                }
                else {
                    self.previousView = null;
                }

                if (_view) {
                    self.stage.addChild(_view);
                    self.currentView = _view;
                }
                else {
                    self.currentView = null;
                }

                view = self.currentView;
                self.stage.update();
            }
            catch (ex) {
                console.log("ERROR FROM showView() :: " + ex);
            }
        }


        function introductionScreen() {

            var instructionScreen = new createjs.Container();

            var memBG = new createjs.Bitmap(queue.getResult("memoryBG"));
            memBG.x = 0;
            memBG.y = 0;
            memBG.scaleX = 1;
            memBG.scaleY = 1;

            var titleText = new createjs.Text(gameData.Title, "36px Arial Black", "#7649AE");
            titleText.shadow = new createjs.Shadow("gray", 1, 1, 3);
            titleText.textAlign = "center";
            titleText.x = 400;
            titleText.y = 400;
            titleText.lineWidth = 780;

            var dirlabel = new createjs.Text("DIRECTIONS:  \n \n You have a limited time to match the terms to their definitions. Good luck!", "bold 20px Arial", "#000000");
            dirlabel.textAlign = "center";
            dirlabel.lineWidth = 400;
            dirlabel.x = 280;
            dirlabel.y = 265;

            var dirBackgroundImage = new createjs.Bitmap(queue.getResult("panel"));
            dirBackgroundImage.x = 49;
            dirBackgroundImage.y = 235;
            dirBackgroundImage.scaleX = 0.64;
            dirBackgroundImage.scaleY = 0.56;

            var memoryMatch = new createjs.Bitmap(queue.getResult("memoryMatchLarge"));
            memoryMatch.x = 32;
            memoryMatch.y = 90;
            memoryMatch.scaleX = memoryMatch.scaleY = 0.94;


            var startButton = new createjs.Bitmap(queue.getResult("startbutton"));
            startButton.regX = 93;
            startButton.regY = 95;
            startButton.x = 600;
            startButton.y = 295;
            startButton.scaleX = startButton.scaleY = 0.50;
            startButton.shadow = new createjs.Shadow("gray", 1, 3, 5);
            instructionScreen.addChild(memBG, dirBackgroundImage, startButton, titleText, dirlabel, instructionScreen, memoryMatch);
            createjs.Tween.get(startButton, { loop: false }).to({ rotation: 360, scaleX: .9, scaleY: .9 }, 2000);

            startButton.addEventListener("click", function () {

                createjs.Sound.play("buttonClick");

                createjs.Tween.get(startButton).to({ alpha: 0 }, 250)
                        .call(function () {
                            self.stage.removeChild(instructionScreen);
                            showView(timerScreen());
                          //  StartInteraction();
                        });
            });

            self.stage.addChild(instructionScreen);
        }


        function timerScreen() {

            var timerScreen = new createjs.Container();

            var memBG = new createjs.Bitmap(queue.getResult("memoryBG"));
            memBG.x = 0;
            memBG.y = 0;
            memBG.scaleX = 1;
            memBG.scaleY = 1;

            var dirlabel = new createjs.Text("DIRECTIONS:  \n \n Select your time limit.", "bold 20px Arial", "#000000");
            dirlabel.textAlign = "center";
            dirlabel.lineWidth = 400;
            dirlabel.x = 280;
            dirlabel.y = 300;

            var dirBackgroundImage = new createjs.Bitmap(queue.getResult("panel"));
            dirBackgroundImage.x = 49;
            dirBackgroundImage.y = 235;
            dirBackgroundImage.scaleX = 0.64;
            dirBackgroundImage.scaleY = 0.56;

            var memoryMatch = new createjs.Bitmap(queue.getResult("memoryMatchLarge"));
            memoryMatch.x = 32;
            memoryMatch.y = 90;
            memoryMatch.scaleX = memoryMatch.scaleY = 0.94;

            // #region 5 minutes
            var verySlowButton = new createjs.Bitmap(queue.getResult("5min"));
            verySlowButton.regX = 93;
            verySlowButton.regY = 95;
            verySlowButton.x = 680;
            verySlowButton.y = 275;
            verySlowButton.scaleX = verySlowButton.scaleY = 0.40;
            verySlowButton.shadow = new createjs.Shadow("gray", 1, 3, 5);


            verySlowButton.addEventListener("click", function () {

                createjs.Sound.play("buttonClick");

                createjs.Tween.get(verySlowButton).to({ alpha: 0 }, 250)
                    .call(function () {
                        self.stage.removeChild(timerScreen);
                        TimerLength = 300000;
                        showView(StartInteraction());
                    });
            });

            // #endregion

            // #region 120 sec 
            var slowButton = new createjs.Bitmap(queue.getResult("120sec"));
            slowButton.regX = 93;
            slowButton.regY = 95;
            slowButton.x = 570;
            slowButton.y = 350;
            slowButton.scaleX = slowButton.scaleY = 0.40;
            slowButton.shadow = new createjs.Shadow("gray", 1, 3, 5);


            slowButton.addEventListener("click", function () {

                createjs.Sound.play("buttonClick");

                createjs.Tween.get(slowButton).to({ alpha: 0 }, 250)
                    .call(function () {
                        self.stage.removeChild(timerScreen);
                        TimerLength = 120000;
                        showView(StartInteraction());
                    });
            });

            // #endregion

            // #region 90 sec 
            var medButton = new createjs.Bitmap(queue.getResult("90sec"));
            medButton.regX = 93;
            medButton.regY = 95;
            medButton.x = 460;
            medButton.y = 425;
            medButton.scaleX = medButton.scaleY = 0.40;
            medButton.shadow = new createjs.Shadow("gray", 1, 3, 5);


            medButton.addEventListener("click", function () {

                createjs.Sound.play("buttonClick");

                createjs.Tween.get(medButton).to({ alpha: 0 }, 250)
                    .call(function () {
                        self.stage.removeChild(timerScreen);
                        TimerLength = 90000;
                        showView(StartInteraction());
                    });
            });

            // #endregion

            // #region 60 sec 
            var fastButton = new createjs.Bitmap(queue.getResult("60sec"));
            fastButton.regX = 93;
            fastButton.regY = 95;
            fastButton.x = 350;
            fastButton.y = 500;
            fastButton.scaleX = fastButton.scaleY = 0.40;
            fastButton.shadow = new createjs.Shadow("gray", 1, 3, 5);

            timerScreen.addChild(memBG, verySlowButton,slowButton, medButton, fastButton, dirlabel, timerScreen, memoryMatch);

            fastButton.addEventListener("click", function () {

                createjs.Sound.play("buttonClick");

                createjs.Tween.get(fastButton).to({ alpha: 0 }, 250)
                    .call(function () {
                        self.stage.removeChild(timerScreen);
                        TimerLength = 60000;
                        showView(StartInteraction());
                    });
            });

            // #endregion

            self.stage.addChild(timerScreen);
        }


        var allCardContainers = [];
        var previousCardClicked = null;
        var gameIsRunning = false;
        var practiceRound = false;
        var gamescreenContainer = new createjs.Container();
        var gamescreen;
        var cardContainer;
        var frontImage;
        var backImage;
        var timeRemaining;
        var points;
        var numberOfmatches;

        // starts game //
        function StartInteraction() {
            gamescreen = new createjs.Bitmap(queue.getResult("gamescreen"));
            gamescreenContainer.addChild(gamescreen);
            self.stage.addChild(gamescreenContainer);
            gameIsRunning = true;
            Clock();
            gamescreenContainer.x = -5;
            //xoffset = -4;
            //xoffset2 = -4;
            numberOfmatches = 0; //start with no matches

            var maxTermCount = 6;
            var termCount = maxTermCount;

            if (termCount > gameData.Terms.length)
                termCount = gameData.Terms.length;

            var containerOfAllCards = new createjs.Container();
            self.stage.addChild(containerOfAllCards);

            var cardWidth = 123, cardHeight = 172, cardMarginX = 4, cardMarginY = 15;

            containerOfAllCards.x = 30 + (maxTermCount - termCount) * (cardWidth / 2);
            containerOfAllCards.y = 50;

            function showFrontImageOfCard(cardContainer, callback) {
                if (gameIsRunning == true) {
                    createjs.Tween.get(cardContainer.BackImage).wait(2000).to({ alpha: 0 }, 100).call(function () {
                        cardContainer.IsTurnedOver = false
                    });

                    if (gameIsRunning == true) {
                        createjs.Tween.get(cardContainer.FrontImage).wait(2000).to({ alpha: 1 }, 75).call(function () {
                            if (callback != null) {
                                callback();
                            }
                        });
                    }
                }
            }

            //CHECK for MATCH
            if (gameIsRunning == true) {
                function checkIfCardsMatch(card1, card2) {
                    if (card1 == null || card2 == null) {
                        return;
                    }
                    if (card1.ID == card2.ID) {

                        // MATCH text
                        if (numberOfmatches != 6) {
                            var itsaMatch = new createjs.Text("MATCH", "40px Arial Black", "lime");
                            itsaMatch.shadow = new createjs.Shadow("white", 1, 2, 2);
                            itsaMatch.lineWidth = 780;
                            itsaMatch.x = 322;
                            itsaMatch.y = 455;



                            //animate MATCH text
                            createjs.Tween.get(itsaMatch)
                            .to({ scaleX: 1.00, scaleY: 1.00, alpha: 0 }, 600)
                            self.stage.addChild(itsaMatch);
                        }


                        numberOfmatches++

                        if ((numberOfmatches != self.gameData.Terms.length) && (numberOfmatches != 6)) {  // should not base off of 6 but number of terms
                            createjs.Sound.play("matchFound");
                        }

                        // console.log("match");
                        if ((numberOfmatches == 6) || (numberOfmatches == self.gameData.Terms.length)) {
                            allMatchsAreMade();
                            DisplayEndingNotes(true)
                        }
                        clickedTimes = 0;
                    }
                    else {
                        if (gameIsRunning == true) {
                            showFrontImageOfCard(card1);
                            showFrontImageOfCard(card2, function () {
                                clickedTimes = 0;
                            });
                        }
                    }
                }
            }


            function toggleTween(tween) {
                if (tween.paused) {
                    tween.paused = false;
                    tween.setPaused(false);
                } else {
                    tween.paused = true;
                    tween.setPaused(true);
                }
            }




            function allMatchsAreMade() {
                gameIsRunning = false;

                // SCORM LMS
                if (isLmsConnected) {
                    ScormHelper.cmi.successStatus(ScormHelper.successStatus.passed);
                    ScormHelper.cmi.completionStatus(ScormHelper.completionStatus.completed);
                }
                               
                // stop timer!   
                toggleTween(mytweentodisable);

                // find time when clock is stopped
                clockStopTime = (new Date()).getTime();

                // timeRemaining = total timer - elapsed // if practiceRound == false
                timeRemaining = ((TimerLength - (clockStopTime - startTime)) / 1000).toFixed(2);

                var allMatches = new createjs.Text("ALL MATCHES MADE!", "60px Arial Black", "lime");
                allMatches.shadow = new createjs.Shadow("black", 1, 2, 2);
                allMatches.lineWidth = 780;
                allMatches.x = 35;
                allMatches.y = 185;
                allMatches.alpha = 0;

                //animate MATCH text
                createjs.Tween.get(allMatches)
             //  .wait(500) // pause
               .to({ scaleX: 1.00, scaleY: 1.00, alpha: 1 }, 100)
               .to({ scaleX: 1.00, scaleY: 1.00, alpha: 0 }, 1600)
                self.stage.addChild(allMatches);

                createjs.Sound.play("success");

            }

            function handleCardContainerClick(evt) {
                if (gameIsRunning == true) {

                    var clickedCardContainer = evt.currentTarget;

                    if (!clickedCardContainer.IsTurnedOver && clickedTimes < 2) {
                        clickedCardContainer.IsTurnedOver = true;

                        clickedTimes = clickedTimes + 1;
                        if (clickedTimes == 1) {
                            previousCardClicked = clickedCardContainer;
                        }
                        createjs.Sound.play("buttonClick");
                        createjs.Tween.get(clickedCardContainer.FrontImage).to({ alpha: 0 }, 50);


                        createjs.Tween.get(clickedCardContainer.BackImage)
                                      .wait(225)
                                      .to({ alpha: 1 }, 10)
                                      .call(function () {
                                          if (previousCardClicked != null && previousCardClicked != clickedCardContainer) {
                                              checkIfCardsMatch(previousCardClicked, clickedCardContainer)
                                              previousCardClicked = null;
                                          }
                                      });
                    }
                }
            }


            
            //randomize cards on screen
            var termIndexes = [];

            for (var i = 0; i < (termCount * 2); ++i){
                termIndexes.push(i);
            }

            // termIndexes now holds the order of the indexes we're going to use
            shuffle(termIndexes);


            function getCoordinateForTermIndex(i) {
                return {
                    x: cardMarginX + (cardWidth * (i % termCount)),
                    y: cardMarginY + (cardHeight * Math.floor(i / termCount))
                }
            }


            // create Term and definition cards pt 1 term names
            for (var t = 0; t < termCount ; t++) {  // loop through 6 TERMS each including a word and definition 

                //// create term container ////////////
                cardContainer = new createjs.Container();
                cardContainer.ID = self.gameData.Terms[t].Id;
                //// add term text over cardFace image
                var term = new createjs.Text(self.gameData.Terms[t].Name, "24pt arial bold", "black");
                term.ID = self.gameData.Terms[t].Id;
                term.textAlign = "center";
                term.lineWidth = 198;
                term.y = 30;
                term.x = 112;

                ////////////////////////////////////////

                frontImage = new createjs.Bitmap(queue.getResult("card"));
                backImage = new createjs.Bitmap(queue.getResult("cardFace"));
                frontImage.scaleX = 1.25;
                frontImage.scaleY = 1.25;
                backImage.scaleX = 1.25;
                backImage.scaleY = 1.25;
                backImage.alpha = 0;


                cardContainer.addChild(backImage, term, frontImage); // add term between backImage and frontImage                    
                cardContainer.FrontImage = frontImage;
                cardContainer.BackImage = backImage; //hides / reveals the term

                var coordinates = getCoordinateForTermIndex(termIndexes[0]);
                termIndexes.splice(0, 1);

                cardContainer.x = coordinates.x;
                cardContainer.y = coordinates.y;
                

                cardContainer.scaleX = .50;
                cardContainer.scaleY = .50;

                cardContainer.IsTurnedOver = false;

                allCardContainers.push(cardContainer);

                containerOfAllCards.addChild(cardContainer);
                var clickedTimes = 0;

                cardContainer.addEventListener("click", handleCardContainerClick);

            }



            // randomize second row       
            function shuffle(array) {
                var currentIndex = array.length, temporaryValue, randomIndex;

                // While there remain elements to shuffle...
                while (0 !== currentIndex) {

                    // Pick a remaining element...
                    randomIndex = Math.floor(Math.random() * currentIndex);
                    currentIndex -= 1;

                    // And swap it with the current element.
                    temporaryValue = array[currentIndex];
                    array[currentIndex] = array[randomIndex];
                    array[randomIndex] = temporaryValue;
                }

                return array;
            }

            self.gameData.Terms = shuffle(self.gameData.Terms);

            // create Term and definition cards pt 2 definitions
            for (var t = 0; t < termCount; t++) {  // loops through the six terms again to get definitions

                //// create definition container //////////// need to randomize these!
                cardContainer = new createjs.Container();
                cardContainer.ID = self.gameData.Terms[t].Id;

                // add definition                                  
                var definition = new createjs.Text(self.gameData.Terms[t].Definition, "24pt arial bold", "black");

                definition.ID = self.gameData.Terms[t].Definition;
                definition.textAlign = "center";
                definition.lineWidth = 198;
                definition.y = 30;
                definition.x = 112;

                ///////////// add card images to container//////
                frontImage = new createjs.Bitmap(queue.getResult("card"));
                backImage = new createjs.Bitmap(queue.getResult("cardFace"));
                frontImage.scaleX = 1.25;
                frontImage.scaleY = 1.25;
                backImage.scaleX = 1.25;
                backImage.scaleY = 1.25;
                backImage.alpha = 0;

                // add definition between bottom backImage and frontImage  
                cardContainer.addChild(backImage, definition, frontImage);
                cardContainer.FrontImage = frontImage;
                cardContainer.BackImage = backImage; //reveals term


                let coordinates = getCoordinateForTermIndex(termIndexes[0]);
                termIndexes.splice(0, 1);

                cardContainer.x = coordinates.x;
                cardContainer.y = coordinates.y;


                //// add second row of cards after 3rd term
                //if (t < 3) {
                //    cardContainer.x = 50 + xoffset;
                //    cardContainer.y = 55;
                //    xoffset = xoffset + 120
                //} else {
                //    cardContainer.x = 50 + xoffset2;
                //    cardContainer.y = 250;

                //    xoffset2 = xoffset2 + 120
                //}

                cardContainer.scaleX = .50;
                cardContainer.scaleY = .50;

                cardContainer.IsTurnedOver = false;

                allCardContainers.push(cardContainer);

                containerOfAllCards.addChild(cardContainer);
                let clickedTimes = 0;

                cardContainer.addEventListener("click", handleCardContainerClick);

            }
        }


        //// see all cards at the end of the round ///////////////////////////////
        function turnOverAllCards() {
            //  alert("test");
            for (var j = 0; j < allCardContainers.length; j++) {
                allCardContainers[j].BackImage.alpha = 1;
                allCardContainers[j].FrontImage.alpha = 0;
            }
            DisplayEndingNotes(false);
        }

        function DisplayEndingNotes(isCompleted) {
            var EndScreen = new createjs.Container();

            var replayContainer = new createjs.Container();
            var exploreContainer = new createjs.Container();

            var replayButton = new createjs.Bitmap(queue.getResult("restart_button"));
            var exploreMore = new createjs.Bitmap(queue.getResult("restart_button"));

            replayButton.x = 590;
            replayButton.y = 445; // was 500
            exploreMore.x = 590;
            exploreMore.y = 505;

            var exploreText = new createjs.Text("90 Second Practice Round", "bold 16px Arial", "#fff");
            exploreText.textAlign = "center";
            exploreText.lineWidth = 140;
            exploreText.y = exploreMore.y + 5;
            exploreText.x = exploreMore.x + 85

            var replayText = new createjs.Text("Replay", "bold 16px Arial", "#fff");
            replayText.textAlign = "center";
            replayText.lineWidth = 140;
            replayText.y = replayButton.y + 15;
            replayText.x = replayButton.x + 85

            replayContainer.addChild(replayButton, replayText);
            exploreContainer.addChild(exploreMore, exploreText);

            var directionsbox = new createjs.Container();
            var closePanel = new createjs.Bitmap(queue.getResult("closePanel"));

            // total matches plus timeRemaining  
            if (practiceRound == true) {
                points = 0;
            }

            if (practiceRound == false) {
                if (timeRemaining != 0) {
                    points = parseInt((numberOfmatches * 100) + (Math.round(timeRemaining)));
                } else {
                    points = parseInt(numberOfmatches * 100);
                }
            }
            closePanel.x = 190;
            closePanel.y = 440;

            if (practiceRound === false) {
                if (isCompleted === true) {

                    let endingText = new createjs.Text("Congratulations! All matches made with " + timeRemaining.toString() + " Seconds remaining! SCORE: " + points.toString(), "Bold 16px Arial", "#FFF");

                } else {

                    // display number of matches in ending text
                    let endingText = new createjs.Text("You got " + numberOfmatches.toString() + " of the possible matches. Try a 90 second practice round or click \"Replay\" to try again. SCORE: " + points.toString(), "16px Arial", "#FFF");

                }

            } else {
                // if practice round
                if (isCompleted === true) {

                    let endingText = new createjs.Text("All matches made with " + timeRemaining.toString() + " seconds remaining during the 90 second practice round. click \"Replay\" to try a 60 second game!", "16px Arial", "#FFF");

                } else {

                    // display number of matches during practice round
                    let endingText = new createjs.Text("You got " + numberOfmatches.toString() + " of the possible matches. Try another 90 second practice round or click \"Replay\" to try again.", "16px Arial", "#FFF");

                }



            }

            endingText.textAlign = "center";
            endingText.lineWidth = 300;
            endingText.y = closePanel.y + 10;
            endingText.x = closePanel.x + 180;
            directionsbox.addChild(closePanel, endingText, replayContainer, exploreContainer); // replay button and more time option
            EndScreen.addChild(directionsbox);

            replayContainer.addEventListener("click", handleClick);

            function handleClick(event) {
                createjs.Sound.play("buttonClick");
                allCardContainers.splice(0, allCardContainers.length)
                self.stage.removeChild(clockContainer);
                self.stage.removeChild(EndScreen);
                gamescreenContainer.removeChild(gamescreen);
                self.stage.removeChild(gamescreenContainer)
                self.stage.removeChild(cardContainer);
                self.stage.removeAllChildren();
                practiceRound = false;

                showView(StartInteraction());
              //  self.stage.start();
            }

            // explore more  / change speed button to 90 seconds minutes
            exploreContainer.addEventListener("click", handleClickexploreContainer);
            function handleClickexploreContainer(event) {
                createjs.Sound.play("buttonClick");
                allCardContainers.splice(0, allCardContainers.length)
                self.stage.removeChild(clockContainer);
                self.stage.removeChild(EndScreen);
                gamescreenContainer.removeChild(gamescreen);
                self.stage.removeChild(gamescreenContainer)
                self.stage.removeChild(cardContainer);
                self.stage.removeAllChildren();
                // 90 second practice round
                TimerLength = 90000;
                practiceRound = true;
              //  self.stage.showView(StartInteraction());
             //  StartInteraction();
                showView(StartInteraction());
            }

            self.stage.addChild(EndScreen);

        }

        //TimerLength = 60000; //60 seconds
        var startTime;
        var time;
        function Clock() {

            clockContainer = new createjs.Container();
            contain = new createjs.Container();
            var clockBack = new createjs.Bitmap(queue.getResult("clockBack"));
            clockHand = new createjs.Bitmap(queue.getResult("clockHand"));
            clockBack.x = 41;//40
            clockBack.y = 440;//480
            clockHand.x = 95;//95
            clockHand.y = 495;//535
            clockHand.regX = 17//16
            clockHand.regY = 130;//130
            clockHand.scaleX = clockHand.scaleY = 0.35;
            clockBack.scaleX = clockBack.scaleY = 0.40;
            contain.addChild(clockHand);
            clockContainer.addChild(clockBack, contain);


            //add time text
            if (TimerLength == 300000) {
                timerTime = ((TimerLength / 1000)/60).toFixed(0);
                var timeText = new createjs.Text(timerTime.toString() + "  minutes", "12px Arial", "#fff");
            } else { 
                timerTime = (TimerLength / 1000).toFixed(0);
                var timeText = new createjs.Text(timerTime.toString() + "  seconds", "12px Arial", "#fff");
            }
            timeText.textAlign = "center";
            timeText.lineWidth = 140;
            timeText.y = clockHand.y + 60;
            timeText.x = clockHand.x;


            self.stage.addChild(clockContainer, timeText)

            //Start Timer to count down and get additional points off time remaining.
            startTime = (new Date()).getTime();

            //TimerLength is a 360 rotation
            mytweentodisable = createjs.Tween.get(clockHand, { loop: false }).to({ rotation: 360 }, TimerLength).call(function () {
                //this will trigger the timer is up
                if (gameIsRunning === true) {

                    // time is out
                    timeRemaining = 0;
                    gameIsRunning = false;
                    setTimeout(turnOverAllCards, 1100); // wait for any flips to finish 
                    createjs.Sound.stop();
                    createjs.Sound.play("gameOver");

                }
            });
        }//clock end

        $(window).bind('beforeunload', function () {
            //for wisc to report score
            submitScore(points)
        })

        var submittedScoreAlready = false;

        function submitScore(score) {
            // alert("test");
            if (submittedScoreAlready == true)
                return false;

            if (points == 0)

                return false;

            var url = gameData.leaderboardUrl;

            if (url) {

                var data = {
                    gameId: gameData.id,
                    score: score
                };

                $.ajax(url, {
                    type: "POST",
                    data: data,
                    success: function (x) {

                    },
                    error: function (x, y, z) {


                    }
                });

            }
            submittedScoreAlready = true;
        }

    }

    return Game;
})(createjs); // END OF function Game(gameData)
