// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

interface IRewardDataUser {

  event AddAdmin(address user, uint256 timestamp);
  event RemoveAdmin(address user, uint256 timestamp);
  event SetRewardAmount(uint256 _amount, uint256 timestamp);
  event RewardToken(address user, string idData, uint256 timestamp);
  

  // function admin
  function addAdmin(address account) external;
  function removeAdmin(address account) external;
  function setRewardAmount(uint256 amount) external;

  // function user
  function rewardToken( address player, string memory idData, bytes[] memory signature) external;
  function showAdminList() external view returns(address[] memory);
}