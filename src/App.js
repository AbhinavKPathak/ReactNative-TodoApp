import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  YellowBox,
  ScrollView,
  TouchableHighlight,
  Image
} from "react-native";
import firebase from "firebase/app";
import "firebase/database";
import _ from "lodash";

// Initialize Firebase
// Add firebase config to config.json
import config from "../config.json";

firebase.initializeApp(config);

export default class App extends React.Component {
  oTodos = {};
  constructor(props) {
    super(props);
    this.state = {
      todo: "",
      date: new Date().toLocaleDateString(),
      errorMessage: ""
    };
    this.getFromFirebase();
  }

  getFromFirebase() {
    fetch(config.databaseURL + "/tasks.json")
      .then(oData => {
        oData
          .json()
          .then(data => {
            if (data) {
              this.oTodos = data;
            }
            this.setState({ todo: "" });
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.log(err);
      });
  }

  onTaskCompletion(id) {
    if (this.oTodos[id].date_completed) {
      firebase
        .database()
        .ref()
        .child("tasks")
        .child(id)
        .child("date_completed")
        .remove()
        .then(() => {
          this.getFromFirebase();
        });
    } else {
      firebase
        .database()
        .ref()
        .child("tasks")
        .child(id)
        .update({
          date_completed: new Date().toLocaleString()
        })
        .then(() => {
          this.getFromFirebase();
        });
    }
  }

  onTaskDeletion(id) {
    console.log(this.oTodos[id]);
    firebase
      .database()
      .ref("tasks/" + id)
      .remove()
      .then(() => {
        this.getFromFirebase();
      });
  }

  updateText(event) {
    if (this.state.todo != "") {
      this.setState({ errorMessage: "" });
      let taskID = Math.floor(new Date() / 1000);
      if (this.state.date != "") {
        firebase
          .database()
          .ref("tasks/" + taskID)
          .set({
            name: this.state.todo,
            date: this.state.date
          })
          .then(() => {
            this.getFromFirebase();
          });
      } else {
        firebase
          .database()
          .ref("tasks/" + taskID)
          .set({
            name: this.state.todo
          })
          .then(() => {
            this.getFromFirebase();
          });
      }
    } else {
      this.setState({ errorMessage: "Please Enter A Todo" });
    }
  }

  render() {
    return (
      <ScrollView style={{ backgroundColor: "#eceff1" }}>
        <View style={styles.container}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Todo App</Text>
          </View>

          {this.state.errorMessage != "" ? (
            <View
              style={{
                backgroundColor: "#d9534f",
                height: 30,
                margin: 10,
                alignItems: "center"
              }}
            >
              <Text style={{ color: "white" }}>{this.state.errorMessage}</Text>
            </View>
          ) : (
            <View />
          )}

          <Text style={{ margin: 10 }}>Task :</Text>
          <TextInput
            ref="todo"
            style={styles.textInput}
            placeholder="Type your text here!"
            value={this.state.todo}
            onChangeText={text => this.setState({ todo: text })}
            onSubmitEditing={() => this.duedate.focus()}
            autoFocus={true}
            blurOnSubmit={false}
          />

          <Text style={{ margin: 10 }}>Due Date :</Text>
          <TextInput
            ref={input => {
              this.duedate = input;
            }}
            style={styles.textInput}
            placeholder="Type your Date here!"
            value={this.state.date}
            onChangeText={text => this.setState({ date: text })}
            onSubmitEditing={() => this.updateText()}
            autoFocus={true}
            blurOnSubmit={false}
          />
          <Text style={styles.textInput}>Type your todo and date above</Text>
          <View
            style={{
              margin: 10,
              height: 50,
              alignItems: "center"
            }}
          >
            <button
              style={{ height: 50, background: "#546e7a", width: 200 }}
              onClick={() => this.updateText()}
            >
              <Text style={{ color: "white" }}>Submit</Text>
            </button>
          </View>

          <View style={styles.todos}>
            {Object.keys(this.oTodos)
              .reverse()
              .map(key => {
                return (
                  <View key={key} style={styles.row}>
                    <TouchableHighlight
                      style={{ alignItems: "flex-end" }}
                      onPress={() => this.onTaskCompletion(key)}
                    >
                      <Image
                        style={styles.check}
                        source={require("../images/2x/baseline_done_black_18dp.png")}
                      />
                    </TouchableHighlight>
                    <TouchableHighlight
                      style={{ alignItems: "flex-end" }}
                      onPress={() => this.onTaskDeletion(key)}
                    >
                      <Image
                        style={styles.check}
                        source={require("../images/2x/baseline_delete_black_18dp.png")}
                      />
                    </TouchableHighlight>
                    {this.oTodos[key].date_completed ? (
                      <Text style={{ textDecorationLine: "line-through" }}>
                        {this.oTodos[key].name}
                      </Text>
                    ) : (
                      <Text>{this.oTodos[key].name}</Text>
                    )}
                    <View
                      style={{
                        alignSelf: "flex-end",
                        flex: 1
                      }}
                    >
                      {this.oTodos[key].date ? (
                        <Text style={{ textAlign: "right" }}>
                          Due Date : {this.oTodos[key].date}
                        </Text>
                      ) : (
                        <Text />
                      )}

                      {this.oTodos[key].date_completed ? (
                        <Text style={{ textAlign: "right" }}>
                          Completed on : {this.oTodos[key].date_completed}
                        </Text>
                      ) : (
                        <Text />
                      )}
                    </View>
                  </View>
                );
              })}
          </View>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "flex-start"
  },
  titleContainer: {
    padding: 10,
    height: 100,
    backgroundColor: "#546e7a",
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    fontSize: 30,
    color: "white"
  },
  textInput: {
    height: 40,
    borderColor: "grey",
    borderWidth: 1,
    margin: 10,
    padding: 10,
    backgroundColor: "white"
  },
  itemText: {
    flex: 1
  },
  row: {
    padding: 10,
    borderBottomWidth: 2,
    borderColor: "#eceff1",
    flexDirection: "row",
    alignSelf: "stretch"
  },
  check: {
    height: 20,
    width: 20,
    marginRight: 10
  },
  todoContainer: {
    borderColor: "grey",
    borderWidth: 1,
    margin: 10,
    padding: 10
  },
  todos: {
    backgroundColor: "white",
    borderColor: "grey",
    borderWidth: 1,
    margin: 10,
    padding: 10
  }
});
