import React from "react";

import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import { graphqlMutation } from "aws-appsync-react";
import { buildSubscription } from "aws-appsync";

const SubscribeToTodos = gql`
  subscription {
    onCreateTodo {
      id
      title
      completed
    }
  }
`;

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

  componentDidMount() {
    this.props.subscribeToMore(buildSubscription(SubscribeToTodos, ListTodos));
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
        <input
          onChange={e => this.setState({ todo: e.target.value })}
          value={this.state.todos}
          placeholder="Todo name"
        ></input>
        <button onClick={this.addTodo}>Add Todo</button>
        {this.props.todos.map((item, i) => (
          <p key={i}>{item.title}</p>
        ))}
      </div>
    );
  }
}

export default compose(
  graphqlMutation(CreateTodo, ListTodos, "Todo"),
  graphql(ListTodos, {
    options: {
      fetchPolicy: "cache-and-network"
    },
    props: props => {
      return {
        subscribeToMore: props.data.subscribeToMore,
        todos: props.data.listTodos ? props.data.listTodos.items : []
      };
    }
  })
)(App);
