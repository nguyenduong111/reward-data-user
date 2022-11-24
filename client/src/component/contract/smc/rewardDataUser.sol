// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Iverify.sol";


contract RewardPool is Ownable, IRewardDataUser {
   
  IERC20 public token;
  uint256 public rewardAmount;

  mapping(address => bool) public isAdmin;
  address[] public adminList;

  mapping(string => bool) public isUsed;
  mapping(string => uint256) public totalAccept;

  constructor(address _token) {
      token = IERC20(_token);
      isAdmin[msg.sender] = true;
      adminList.push(msg.sender);
  }

  function addAdmin(address account)
    public
    override
    onlyOwner
    notHasAdminRole(account)
  {
    adminList.push(account);
    isAdmin[account] = true;
    emit AddAdmin(account, block.timestamp);
  }

  function removeAdmin(address account)
    public
    override
    onlyOwner
    hasAdminRole(account)
  {
    uint256 adminLength = adminList.length;
    for (uint256 index = 0; index > adminLength; index++) {
      if (adminList[index] == account) {
        adminList[index] = adminList[adminLength - 1];
        isAdmin[account] = false;
        adminList.pop();
        break;
      }
    }
    emit RemoveAdmin(account, block.timestamp);
  }

  function setRewardAmount(uint256 amount) public override onlyOwner {
      rewardAmount = amount;
      emit SetRewardAmount(amount, block.timestamp);
  }

  modifier hasAdminRole(address account) {
    require(isAdmin[account], "RewardPool contract Account is not a admin!");
    _;
  }

  modifier notHasAdminRole(address account) {
    require(!isAdmin[account], "RewardPool contract Account is a admin!");
    _;
  }

  modifier isUsedCoupons(string memory couponReleaseTime) {
        require(isUsed[couponReleaseTime] == false, "coupon already used");
        _;
  }  

    //@dev check signer of mess == addrPubServer
    function checkSigner(
        address player, 
        string memory amount, 
        bytes memory signature) private {
        bytes32 check = hashMessage(player, amount);
        require(ecrecoverMessage(check, signature) == true, "unauthenticated message");

        totalAccept[amount]++;
        
    }

    //@dev convert signature to (r,s,v)
    function splitSignature(bytes memory sig)
        private
        pure
        returns (
            bytes32 r,
            bytes32 s,
            uint8 v
        )
    {
        require(sig.length == 65, "invalid signature length");

        assembly {

            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

    //@dev hash message with EIP-191 
    function hashMessage(address player, string memory amount) isUsedCoupons(amount) private view returns (bytes32) {
        
        //convert addr of player to string
        string memory addr = Strings.toHexString(uint256(uint160(player)), 20);

        // Combine the addrPlayer, amounts, timestamp fields into a single string
        string memory message = string(bytes.concat(bytes(addr),bytes(amount)));

        // The message header; we will fill in the length next
        string memory header = "\x19Ethereum Signed Message:\n000000";

        uint256 lengthOffset;
        uint256 length;
        assembly {
            // The first word of a string is its length
            length := mload(message)
            // The beginning of the base-10 message length in the prefix
            lengthOffset := add(header, 57)
        }

        // Maximum length we support
        require(length <= 999999);

        // The length of the message's length in base-10
        uint256 lengthLength = 0;

        // The divisor to get the next left-most message length digit
        uint256 divisor = 100000;

        //convert and encode message (according to keccak256) to bytes32
        while (divisor != 0) {

            // The place value at the divisor
            uint256 digit = length / divisor;
            if (digit == 0) {
                // Skip leading zeros
                if (lengthLength == 0) {
                    divisor /= 10;
                    continue;
                }
            }

            // Found a non-zero digit or non-leading zero digit
            lengthLength++;

            // Remove this digit from the message length's current value
            length -= digit * divisor;

            // Shift our base-10 divisor over
            divisor /= 10;

            // Convert the digit to its ASCII representation (man ascii)
            digit += 0x30;
            // Move to the next character and write the digit
            lengthOffset++;

            assembly {
                mstore8(lengthOffset, digit)
            }
        }

        if (lengthLength == 0) {
            lengthLength = 1 + 0x19 + 1;
        } else {
            lengthLength += 1 + 0x19;
        }

        assembly {
            mstore(header, lengthLength)
        }

        bytes32 check = keccak256(abi.encodePacked(header, message));
        return check;
    }

    function ecrecoverMessage(bytes32 hashMess, bytes memory signature) private view returns(bool) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        address ad = ecrecover(hashMess, v, r, s);

        return isAdmin[ad];
    }

    //@dev reward token after verify
    function rewardToken(
        address player, 
        string memory idData, 
        bytes[] memory signature) 
        public
        override 
        {

        for(uint256 i = 0; i < signature.length; i ++) {
            checkSigner(player, idData, signature[i]);
        }

        require(totalAccept[idData] >= (adminList.length / 2) + 1, "not enough accept to reward");
        require(token.balanceOf(address(this)) >= rewardAmount, "not enough tokens to reward");
        token.transfer(player, rewardAmount);
        isUsed[idData] = true;
        emit RewardToken(player, idData, block.timestamp);
    }

    function showAdminList() public override view returns(address[] memory) {
        return adminList;
    }
}
