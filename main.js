// req-005 wrap the entire function in IIFE
(function(){
    // req-001 retrieve a deck of cards
    fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
        .then((response) => {
            return response.json();
        })
        .then((myJson) => {
            let deckID = myJson.deck_id;
            // req-002 request 5 cards from the deck
            return fetch(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=5`);
            // return fetch('https://www.mikecaines.com/cards/royalflush.json');
            // return fetch('https://www.mikecaines.com/cards/straightflush.json');
            // return fetch('https://www.mikecaines.com/cards/fourofakind.json');
            // return fetch('https://www.mikecaines.com/cards/fullhouse.json');
            // return fetch('https://www.mikecaines.com/cards/flush.json');
            // return fetch('https://www.mikecaines.com/cards/highstraight.json');
            // return fetch('https://www.mikecaines.com/cards/lowstraight.json');
            // return fetch('https://www.mikecaines.com/cards/threeofakind.json');
            // return fetch('https://www.mikecaines.com/cards/twopair.json');
            // return fetch('https://www.mikecaines.com/cards/pair.json');
        })
        .then((response2) => {
            return response2.json();
        })
        .then((myDeck) => {
      
            // req-003 display the hand in page
            for(let i in myDeck.cards) {
                document.getElementById("cards").innerHTML += "<img src=" +myDeck.cards[i].image+ ">";
            }
            // console.log("my cards: " + cards);
            let rank = getHighestPokerHands(myDeck.cards);

            // display highest poker hand to page
            for(let i in myDeck.cards) {
                if(myDeck.cards[i].hasOwnProperty("transparent") && myDeck.cards[i].transparent === true) {
                    document.getElementById("pokerhands").innerHTML += "<img class='transparent' src=" + myDeck.cards[i].image+ ">";
                } else {
                    document.getElementById("pokerhands").innerHTML += "<img src=" + myDeck.cards[i].image+ ">";
                }
            }
            document.getElementsByTagName("h1")[0].innerHTML += "<span>" + rank + "</span>";
        }); // end of fetch()


    // Helper functions start ----------------------------------------
    // declare the sequence of cards
    const seq = ["ACE", "2", "3", "4", "5", "6", "7", "8", "9", "10", "JACK", "QUEEN", "KING"];
    
    // function that will sort the cards
    var sortCards = ((cards) => {
        // sort the cards according to their indexes in seq
        return cards.sort((a,b) => {
            return seq.indexOf(a.value) - seq.indexOf(b.value);
        });
    });

    // function that will count cards with the same values
    // and for determining if four of a kind, full house, 3 of a kind, 2 pair or pair
    var countDupes = ((cards) => {
        let count = 0;
        let dupes = [], duplicates = [];

        sortCards(cards);   // sort cards
        // look at each card starting from index 1
        for(let i = 1; i < cards.length; i++) {
            // check value on previous index and current index if they are the same
            if(cards[i-1].value === cards[i].value) {
                if(dupes.length === 0) {
                    // push to the temporary array
                    dupes.push(cards[i-1].value);
                    cards[i-1].transparent = false; // adds the property transparent
                }
                dupes.push(cards[i].value);
                cards[i].transparent = false;   // adds the property transparent

                if(i === cards.length-1) {
                    duplicates.push(dupes);
                }
            }
            else {
                // if it doesn't match
                if(dupes.length !== 0) {
                    cards[i].transparent = true;    // adds the property transparent
                    // push this array of numbers to another array
                    duplicates.push(dupes);
                    dupes = []; // reset
                }
                else {
                    if(i === cards.length-1) {
                        cards[i].transparent = true;    // adds the property transparent
                    }
                    cards[i-1].transparent = true;  // adds the property transparent
                }
            }
        }

        // to check if there are fullhouse or two pairs
        if(duplicates.length === 2) {
            for(let i in duplicates) {
                if(duplicates[i].length === 3) {
                    return 32;  // full house
                } 
            }
            count = 22; // two pairs
        }
        else if(duplicates.length === 1) {
            for(let i in duplicates) {
                switch(duplicates[i].length) {
                    case 2:
                        count = 2; break;   // pair
                    case 3:
                        count = 3; break;   // 3 of a kind
                    case 4:
                        count = 4; break;   // 4 of a card
                }
            }
        }

        // return the number of duplicates
        return count;
    }); // countDupes

    // A, K, Q, J, 10, all the same suit.
    var isRoyalFlush = ((cards) => {
        const royals = ["10", "JACK", "QUEEN", "KING", "ACE"];
        sortCards(cards);
        if(isFlush(cards)) {    // will check if all same suit
            for(let i = 0; i < cards.length; i++) {
                if(royals.indexOf(cards[i].value) === -1) { // checks if the card is in the royals array
                    return false;
                }
            }
            return true;
        }    
        return false;
    });

    // Any five cards of the same suit, but not in a sequence.
    // Ref: https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_every3
    var isFlush = ((cards) => {
        // let same = false;
        return cards.every(function(el,i,arr) {
            delete arr[i].transparent;  // transparent property not needed here so delete
            if(i === 0) {
                return true;
            }
            else {
                return (el.suit === arr[i - 1].suit);
            }
        });
        // return same;
    });

    // Five cards in a sequence, but not of the same suit.
    var isStraight = ((cards) => {
        sortCards(cards);   // sort cards

        // determine if the values are increasing
        let increasing = true;
        let start = 1;  // the starting index of the for loop

        if(seq.indexOf(cards[0].value) === 0 && seq.indexOf(cards[1].value) === 9) {
            start = 2;
        }
        for(let i = start; i < cards.length; i++) {
            if(seq.indexOf(cards[i-1].value)+1 !== seq.indexOf(cards[i].value)) {   
                increasing = false;
            }
        }

        // remove transparent property
        for(let i in cards) {
            delete cards[i].transparent;
        }
        return increasing;
    }); // isStraight

    // Five cards in a sequence, all in the same suit.
    var isStraightFlush = ((cards) => {
        if(isFlush(cards) && isStraight(cards)) {
            return true;
        }
        return false;
    });

    // All four cards of the same rank.
    var isFourOfAKind = ((cards) => {
        if(countDupes(cards) === 4) {
            return true;
        }
        return false;
    });

    // Three of a kind with a pair.
    var isFullHouse = ((cards) => {
        if(countDupes(cards) === 32) {
            return true;
        }
        return false;
    });

    // Three cards of the same rank.
    var isThreeOfAKind = ((cards) => {
        if(countDupes(cards) === 3) {
            return true;
        }
        return false;
    });

    // Two different pairs.
    var isTwoPair = ((cards) => {
        if(countDupes(cards) === 22) {
            return true;
        }
        return false;
    });

    // Two cards of the same rank.
    var isPair = ((cards) => {
        if(countDupes(cards) === 2) {
            return true;
        }
        return false;
    });
    // Helper functions end ----------------------------------------

    // req-004 Write a function that will determine the highest poker hand for the displayed cards
    var getHighestPokerHands = ((cards) => {
        let rank = "";
        if(isRoyalFlush(cards)) {
            rank = "Royal Flush";
        }
        else if(isStraightFlush(cards)) {
            rank = "Straight Flush";
        }
        else if(isFourOfAKind(cards)) {
            rank = "Four of a kind";
        }
        else if(isFullHouse(cards)) {
            rank = "Full house";
        }
        else if(isFlush(cards)) {
            rank = "Flush";
        }
        else if(isStraight(cards)) {
            rank = "Straight";
        }
        else if(isThreeOfAKind(cards)) {
            rank = "Three of a kind";
        }
        else if(isTwoPair(cards)) {
            rank = "Two pair";
        }
        else if(isPair(cards)) {
            rank = "Pair";
        }
        else {
            // When you haven't made any of the hands above, the highest card plays.
            sortCards(cards);
            rank = "High card";
            if(cards[0].value === "ACE") {
                cards[0].transparent = false;
            } else {
                cards[cards.length-1].transparent = false;
            }
        }
        return rank;
    }); // getHighestPokerHands
})();   // IIFE
