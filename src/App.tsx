import { useState } from 'react'
import { ethers } from 'ethers'

import Greeter from '../artifacts/contracts/Greeter.sol/Greeter.json'
import Token from '../artifacts/contracts/Token.sol/Token.json'
import Caller from '../artifacts/contracts/Caller.sol/Caller.json'
import './App.css'

const greeterAddress = '0x0165878A594ca255338adfa4d48449f69242Eb8F'
const tokenAddress = '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853'
const callerAddress = '0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44'

function App() {
  const [greeting, setGreetingValue] = useState<string>()
  const [userAccount, setUserAccount] = useState<string>()
  const [amount, setAmount] = useState<string>()
  const [oracleAddress, setOracleAddress] = useState<string>()

  const requestAccount = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    return accounts[0]
  }

  const fetchGreeting = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, provider)
      try {
        const data = await contract.greet()
        console.log('data: ', data)
      } catch (err) {
        console.log('Error: ', err)
      }
    }
  }

  async function setGreeting() {
    if (!greeting) return
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer)
      const transaction = await contract.setGreeting(greeting)
      await transaction.wait()
      fetchGreeting()
    }
  }

  const getBalance = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const account = await requestAccount()
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(tokenAddress, Token.abi, provider)
      const balance = await contract.balanceOf(account)
      console.log('Balance: ', balance.toString())
    }
  }

  const sendCoins = async () => {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(tokenAddress, Token.abi, signer)
      const transaction = await contract.transfer(userAccount, amount)
      await transaction.wait()
      console.log(`${amount} Coins successfully sent to ${userAccount}`)
    }
  }

  const confirmOracleAddress = async () => {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.WebSocketProvider('ws://localhost:8545')
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(callerAddress, Caller.abi, signer)
      contract.on('OracleAddressChanged', (address: string) => {
        console.log(`Oracle Address successfully set to ${address}`)
      })
      contract.on('RandomNumberRequested', (id: number) => {
        console.info(`RandomNumberRequested: ${id}`)
      })
      contract.on('RandomNumberReceived', (randomNumber: number, id: number) => {
        console.info(`RandomNumberReceived: ${id} ${randomNumber}`)
      })
      const transaction = await contract.setRandOracleAddress(oracleAddress)
      await transaction.wait()
    }
  }

  const getRandomNumber = async () => {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.WebSocketProvider('ws://localhost:8545')
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(callerAddress, Caller.abi, signer)
      const transaction = await contract.getRandomNumber()
      await transaction.wait()
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={fetchGreeting}>Fetch Greeting</button>
        <button onClick={setGreeting}>Set Greeting</button>
        <input onChange={e => setGreetingValue(e.target.value)} placeholder="Set greeting" />
        <br />
        <button onClick={getBalance}>Get Balance</button>
        <button onClick={sendCoins}>Send Coins</button>
        <input onChange={e => setUserAccount(e.target.value)} placeholder="Account ID" />
        <input onChange={e => setAmount(e.target.value)} placeholder="Amount" />
        <br />
        <button onClick={confirmOracleAddress}>Set Oracle Address</button>
        <input onChange={e => setOracleAddress(e.target.value)} placeholder="Oracle Address" />
        <button onClick={getRandomNumber}>Get Random Number</button>
      </header>
    </div>
  )
}

export default App
