import React from "react";

import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import { graphqlMutation } from "aws-appsync-react";

const CreateTodo = gql`
  mutation($title: String!, $completed: Boolean) {
    createTodo(input: { title: $title, completed: $completed }) {
      id
      title
      completed
    }
  }
`;

const ListTodos = gql`
  query {
    listTodos {
      items {
        id
        title
        completed
      }
    }
  }
`;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { todo: "" };
    this.addTodo = this.addTodo.bind(this);
  }

  addTodo() {
    if (this.state.todos === "") return;
    const todo = {
      title: this.state.todo,
      completed: false
    };

    this.props.createTodo(todo);
    this.setState({ todo: "" });
  }

  render() {
    return (
      <div className="App">
        <input onChange={e => this.setState({ todo: e.target.value })}></input>
        {this.props.todos.map((item, i) => (
          <p key={i}>{item.title}</p>
        ))}
      </div>
    );
  }
}

export default compose(
  graphql(ListTodos, {
    options: {
      fetchPolicy: "cache-and-network"
    },
    props: props => {
      return {
        todos: props.data.listTodos ? props.data.listTodos.items : []
      };
    }
  })
)(App);
