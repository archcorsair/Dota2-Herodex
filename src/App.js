import React, { Component } from 'react';
import got from 'got'
import dotalogo from './dotalogo.png';
import './App.css';

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      heroes: {},
    }
    this.renderHeroes = this.renderHeroes.bind(this)
    this.fethData = this.fetchData.bind(this)
  }

  componentWillMount() {
    this.fetchData()
  }

  fetchData() {
    setTimeout(() => {
      got('localhost:4000/heroes')
      .then((response) => {
        const heroData = JSON.parse(response.body)
        this.setState({ heroes: heroData.heroes })
      })
    }, 100)
  }

  renderHeroes() {
    const inner = []
    if (this.state.heroes.length) {
      this.state.heroes.map((hero, i) => {
        return inner.push(<div key={i}><a href={hero.url} target='_blank'>{hero.name}</a></div>)
      })
    }
    return(
      inner
    );
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={dotalogo} width='150' alt='presentation'/>
          <h1>Current Heroes {`(${this.state.heroes.length})`}</h1>
          {this.renderHeroes()}
        </div>
      </div>
    );
  }
}
