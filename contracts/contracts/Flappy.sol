pragma solidity 0.5.0;

contract Flappy {
    uint public silverScore = 10;
    uint public goldScore = 40;
    uint public fee = 1 finney;
    uint public silverPrize = 1 finney;
    uint public goldPrize = 5 finney;
    uint public newRecordPrize = 10 finney;
    address public owner;

    uint[] public price = [0, 10 finney, 30 finney, 40 finney, 50 finney, 1 ether];
    mapping (address => bool) public isPlaying;

    mapping (address => string) public ownedBirds;

    modifier onlyOwner() {
        require(msg.sender == owner, 'only contract owner can peform this');
        _;
    }

    constructor () public {
        owner = msg.sender;
    }

    function setSilverPrize(uint prize)
        public
    {
        silverPrize = prize;
    }

    function setGoldPrize(uint prize)
        public
    {
        goldPrize = prize;
    }

    function setNewRecordPrize(uint prize)
        public
    {
        newRecordPrize = prize;
    }

    function play()
        public
        payable
    {
        // require(!isPlaying[msg.sender], 'player must not in game');
        require(msg.value >= fee, 'you must pay for playing');
        if (msg.value > fee) {
            msg.sender.transfer(msg.value - fee);
        }
        isPlaying[msg.sender] = true;
    }

    function endGame(uint score)
        public
    {
        require(isPlaying[msg.sender], 'player must be in game');
        isPlaying[msg.sender] = false;
        if (score >= goldScore) {
            msg.sender.transfer(goldPrize);
        } else if (score >= silverScore) {
            msg.sender.transfer(silverPrize);
        }
    }

    function quit()
        public
    {
        isPlaying[msg.sender] = false;
    }

    function purchase(uint birdId)
        public
        payable
    {
        require(msg.value >= price[birdId], 'value is not enough');
        string memory currentBirds = ownedBirds[msg.sender];
        string memory birdIdStr = uintToString(birdId);
        ownedBirds[msg.sender] = string(abi.encodePacked(currentBirds, birdIdStr));
    }

    function uintToString(uint u)
        internal
        pure
        returns (string memory _uintAsString)
    {
        uint _i = u;
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        while (_i != 0) {
            bstr[k--] = byte(uint8(48 + _i % 10));
            _i /= 10;
        }
        return string(bstr);
    }

    function withdrawal(uint amount)
        public
        onlyOwner
    {
        require(amount < address(this).balance, 'amount must be less than contract balance');
        selfdestruct(msg.sender);
    }

    function destroy()
        public
        onlyOwner
    {
        selfdestruct(msg.sender);
    }
}