// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./ICaller.sol";

contract RandOracle is AccessControl {
    bytes32 public constant PROVIDER_ROLE = keccak256("PROVIDER_ROLE");
    uint private randNonce = 0;
    // current number of provider
    uint private numProviders = 0;
    // minimum number of provider
    uint private providersThreshold = 1;

    mapping(uint256 => bool) private pendingRequests;

    struct Response {
        address providerAddress;
        address callerAddress;
        uint256 randomNumber;
    }

    mapping(uint256 => Response[]) private idToResponses;

    // Events
    event RandomNumberRequested(address indexed callerAddress, uint id);
    event RandomNumberReturned(
        uint256 randomNumber,
        address callerAddress,
        uint id
    );
    event ProviderAdded(address providerAddress);
    event ProviderRemoved(address providerAddress);
    event ProvidersThresholdChanged(uint threshold);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function requestRandomNumber() external returns (uint256) {
        require(numProviders > 0, "No data providers not yet added.");
        randNonce++;
        uint id = uint(
            keccak256(abi.encodePacked(block.timestamp, msg.sender, randNonce))
        ) % 1000;
        pendingRequests[id] = true;
        emit RandomNumberRequested(msg.sender, id);
        return id;
    }

    function returnRandomNumber(
        uint256 randomNumber,
        address callerAddress,
        uint id
    ) external onlyRole(PROVIDER_ROLE) {
        require(pendingRequests[id], "Request not found.");
        Response memory res = Response(msg.sender, callerAddress, randomNumber);
        idToResponses[id].push(res);
        uint numResponses = idToResponses[id].length;
        if (numResponses == providersThreshold) {
            uint compositeRandomNumber = 0;
            for (uint i = 0; i < idToResponses[id].length; i++) {
                compositeRandomNumber =
                    compositeRandomNumber ^
                    idToResponses[id][i].randomNumber; // bitwise XOR
            }
            delete pendingRequests[id];
            delete idToResponses[id];

            ICaller(callerAddress).fulfillRandomNumberRequest(
                compositeRandomNumber,
                id
            );
            emit RandomNumberReturned(compositeRandomNumber, callerAddress, id);
        }
    }

    function addProvider(
        address provider
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!hasRole(PROVIDER_ROLE, provider), "Provider already added.");

        _grantRole(PROVIDER_ROLE, provider);
        numProviders++;

        emit ProviderAdded(provider);
    }

    function removeProvider(
        address provider
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            !hasRole(PROVIDER_ROLE, provider),
            "Address is not a recognized provider."
        );
        require(numProviders > 1, "Cannot remove the only provider.");

        _revokeRole(PROVIDER_ROLE, provider);
        numProviders--;

        emit ProviderRemoved(provider);
    }
}
