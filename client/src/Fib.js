// React imports
import React, { Component } from 'react';

// Module for making requests to the backend Express server
import axios from 'axios';

// New class Fib, which will extend the "Component" base class
class Fib extends Component {
    state = {
        seenIndexes: [],
        values: {},
        index:  ''
    };

    componentDidMount() {
        this.fetchValues();
        this.fetchIndexes();
    }

    async fetchValues() {
        const values = await axios.get('/api/values/current');
        this.setState({ values: values.data });
    }

    // Fetch indices that have ever been submitted to app
    async fetchIndexes() {
        const seenIndexes = await axios.get('/api/values/all');
        this.setState({
            seenIndexes: seenIndexes.data
        });
    }

    // Handles the submit information
    handleSubmit = async (event) => {
        event.preventDefault();

        await axios.post('/api/values', {
            index: this.state.index
        });
        this.setState({ index: ''});
    }

    // Will render seen indices on page
    renderSeenIndexes() {
        return this.state.seenIndexes.map(({ number }) => number).join(', ');
    }

    // Will render calculated values on page
    renderValues() {
        const entries = [];

        for (let key in this.state.values) {
            entries.push(
                <div key={key}>
                    For index {key} I calculated {this.state.values[key]}
                </div>
            );
        }

        return entries;
    }

    // Render method
    render() {
        return (
            <div>
               <form onSubmit={this.handleSubmit}>
                    <label>Enter your index:</label>
                    <input
                        value={this.state.index}
                        onChange={event=> this.setState({ index: event.target.value })}
                    />
                    <button>Submit</button>
                </form>
                <h3>Indices I have seen:</h3>
                {this.renderSeenIndexes()}

                <h3>Calculated Values:</h3>
                {this.renderValues()}
            </div>
        );
    }
}

export default Fib;