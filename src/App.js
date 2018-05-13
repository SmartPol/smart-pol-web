import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";


function Header(props){
    const profilePic = props.user.name ? <img src={props.user.image || "sources/user.png" } className="userImg"/> : null;
    return (
    <div className="header flex">
        <div className="logo">
            <img src="sources/logo.png" className="width160" />
        </div>

        <div class="flex2">
          <ul class="nav navbar-nav">
            <li class="active">
              <a href="questions.html" class="colorBlue">Questions</a>
            </li>
            <li>
              <a href="#" class="colorBlue">Posts</a>
            </li>
          </ul>
        </div>

        <div className="flex8">
            <div className="inner-addon left-addon marginTop10">
                <i className="glyphicon glyphicon-search colorBlue searchIcon"></i>
                <input type="text" className="searchInput" placeholder="Search" />
            </div>
        </div>

        <div className="userInfo">
            <a href="#" className="colorBlue"> {(props.user || {}).name }</a>
            {profilePic}
        </div>
    </div>

    );
}
function AskQuestion(props){
    return (
    <div className="questionButton">
      <a href="#" class="button"> Ask a question </a>
    </div>

    );
}

function pluralize(count, word){
    if(count === 1){
        return word;
    }
    return word + "s";
}

function AnswersTitle(props){
    return (<h4 className="answers"> {props.count || 0} {pluralize(props.count, "Answer")} </h4>);
}

function Comment(props){
    return (
        <li>
            {props.text} –
            <a href="#" className="colorBlue"> {(props.user || {}).name} </a>
            <span className="date"> {props.createdAt} </span>
            <hr className="margin7-0"/>
        </li>
    );
}

function add_comment(user, type, text, id){
    const mutation = `
mutation{
  createComment(${type}Id:${id}, description:"${text}", userId: ${user.id}){
    id
  }
}`;
    return fetch("https://smart-pol-api.herokuapp.com/api", {
        body: JSON.stringify({
            query : mutation
        }),
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
            'content-type': 'application/json'
        },
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // *client, no-referrer
    });
}



class AddComment extends Component {
    state = {
        editing : false,
        comment : ""
    }
    constructor(){
        super();
        this.handleChange = this.handleChange.bind(this);
        this.handlePost = this.handlePost.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleStartEdit = this.handleStartEdit.bind(this);
    }
    handleCancel(){
        this.setState({
            editing : false,
            comment : ""
        });
    }
    handleStartEdit(){
        this.setState({
            editing : true
        });
    }
    handlePost(){
        var entity = this.props.entity;
        var comment = this.state.comment.trim();
        var type = entity.type;
        var id = entity.data.id;
        var user = this.props.user;
        add_comment(user, type, comment, id);
        var c = {
            description : comment,
            user : this.props.user,
            createdAt : new Date().toISOString()
        };
        this.props.comments.push(c);
        this.props.onCommentAdd(c);
        this.handleCancel();
    }

    handleChange(e){
        this.setState({ comment : e.target.value });
    }
    render(){
        if(this.state.editing){
            return (
            <div>
                    <div><textarea rows="5" cols="60" onChange={this.handleChange} value={this.state.comment}/></div>
                    <a href="#" onClick={this.handlePost}>Post</a>
                    <a href="#" onClick={this.handleCancel}>Cancel</a>
            </div>);
        }else {
            return (<a href="#" onClick={this.handleStartEdit} className="colorBlue"> add a comment </a>);
        }
    }
}

function CommentsList(props){
    const comments = props.comments;
    return (
    <div className="marginLeft30">
        <h5 className="bold"> Comments </h5>
        <ul className="commentsList">
            <li>
                <hr className="margin7-0"/>
            </li>
            { comments.map(c => (<Comment text={c.description} user={c.creator} date={c.createdAt} />)) }
            <li>
            <AddComment comments={comments} user={props.user} entity={props.entity} onCommentAdd={props.onCommentAdd}/>
            </li>
        </ul>
    </div>
    );
}

function Answer(props){
    const answer = props.answer;
    const hasAccepted = props.hasAccepted;
    const onVote = !answer.hasVoted ? props.onVote : function(){};
    const onAccept = !hasAccepted ? props.onAccept : function(){};
    const profilePic = answer.user ? <img src={answer.user.profilePic || "sources/user.png"} className="postUserImg"/> : null;
    var tick = null;
    if (answer.accepted) {
        tick = (<div className="marginTop10"
                     onClick={()=>props.onAccept(answer)}>
                    <img src="sources/ok.png"  className="width30"/>
                </div>);
    }else {
        tick = (<div className="tick marginTop10"
                onClick={()=>onAccept(answer)}>
                {!hasAccepted ? <img src="sources/un_ok.png" className="width30"/> : null}
                </div>);

    }
    return (
        <div className="answer flex margin30">
          <div className="votesAnswer">
            <a href="#" onClick={()=> onVote(true, answer)}> <img src="sources/up.png" className="width30" /></a>
            <div className="votesNo">{answer.totalVotes || 0}</div>
            <a href="#" onClick={()=> onVote(false, answer)}> <img src="sources/down.png"  className="width30" /></a>
            {tick}
          </div>
          <div className="flex10">
            <p className="marginBottom15">
            {answer.description}
            </p>
            <div className="marginBottom25">
            {profilePic}
            <a href="#" className="colorBlue"> {(answer.user || {}).name} </a>
            <span className="postDate"> {answer.createdAt} </span>
            </div>

          </div>
          <div className="whiteBlock">  </div>
        </div>


    );
}



function AnswersList(props){
    var answers = props.answers;
    var acceptedAnswers = answers.filter(a => a.accepted);
    var hasAccepted = acceptedAnswers.length > 0;
    return ( <div> { props.answers.map(a => (<Answer onCommentAdd={props.onCommentAdd}
                                             user={props.user} hasAccepted={hasAccepted}
                                             onAccept={props.onAccept}
                                             onVote={props.onVote} answer={a} />)) } </div>);
}


function Question(props){
    var question = props.question;
    var hasVoted = question.hasVoted;
    const profilePic = question.user ? <img src={(question.user || {}).profilePic || "sources/user.png" } className="postUserImg"/> : null;
    return (
    <div className="flex margin30">
      <div className="votesPost marginTop22">
            <a href="#" onClick={!hasVoted ? ()=> props.onVote(true, question) : null}> <img src="sources/up.png" className="width30" /></a>
            <div className="votesNo">{question.totalVotes || 0}</div>
            <a href="#" onClick={!hasVoted ? ()=> props.onVote(false, question) : null}> <img src="sources/down.png" className="width30" /></a>
      </div>
      <div className="flex10">
            <h2> {question.title} <span className="postDate"> {question.createdAt} </span> </h2>
        <p className="marginBottom15">
            {question.description}
        </p>
            <div className="marginBottom25">
            {profilePic}
            <a href="#" className="colorBlue"> {(question.user || {}).name} </a>
            </div>

            <CommentsList user={props.user} onCommentAdd={props.onCommentAdd} entity={{type: "post", data : question}} comments={question.comments || []} />

      </div>
      <div className="whiteBlock"> </div>
    </div>


    );
}


function capitalize(str){
    var first = str[0];
    var rest = str.substr(1, str.length);
    return first.toUpperCase() + rest;
}

function cast_vote(post, type, isUp){
    const mutation = `
mutation {
  update${capitalize(type)}Vote(${type}Id: ${post.id}, increase:${isUp === true}) {
    description
    id
    totalVotes
  }
}`;
    return fetch("https://smart-pol-api.herokuapp.com/api", {
        body: JSON.stringify({
            query : mutation
        }),
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
            'content-type': 'application/json'
        },
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // *client, no-referrer
    });
}

function acceptCall(answer){
    const mutation = ``;
    return fetch("https://smart-pol-api.herokuapp.com/api", {
        body: JSON.stringify({
            query : mutation
        }),
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
            'content-type': 'application/json'
        },
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // *client, no-referrer
    });
}

function queryForQuestion(questionId, currentUserId){
  const query =  `
query {
	user(id: ${currentUserId}){
    id,
    name,
    image,
    points,
    type
  }
  post(id: ${questionId}){
    id,
    title,
    createdAt,
    description,
    totalVotes,
    creator {
      name, image, id
    },
    comments {
      id, description, creator {
        name, id, image, createdAt
      }
    }
    answers {
      description,
      id,
      totalVotes,
      creator {
        name, id, image
      },
      comments {
      	id, description, creator {
          name, id, image, createdAt
        }
      }
    }
  }
}`;
    return  fetch("https://smart-pol-api.herokuapp.com/api", {
        body: JSON.stringify({
            query : query
        }),
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
            'content-type': 'application/json'
        },
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // *client, no-referrer
    }).then(x => x.json());
}


export class App extends Component {
    componentDidMount(){
        const self = this;
        queryForQuestion(1,1).then(function(data){
            self.setState(data.data);
        });
    }
    render() {
        const self = this;
        var data = this.state || {};
        var q = data.post || {};
        var answers = q.answers || [];
        var user = data.user || {};
        const updateVote = function(isUp, post){
            if(isUp)
                post.totalVotes++;
            else
                post.totalVotes--;
            post.hasVoted = true;
            self.setState(data);
        };
        const acceptAnswer = function(answer){
            answer.accepted = !answer.accepted;
            self.setState(data);

            acceptCall(answer);
        };
      return (
      <div>
              <Header user={user}/>
              <Question onCommentAdd={(c)=> this.setState(this.state)} user={user} question={q} onVote={(isUp, q) =>{
                  updateVote(isUp, q);
                  cast_vote(q, "post", isUp).then(null, function(){
                      updateVote(!isUp, q);
                  });
              }}/>
              <AnswersTitle count={answers.length || 0} />
              <AnswersList user={user} answers={answers}
                onAccept={acceptAnswer}
                onCommentAdd={(c)=> this.setState(this.state)}
                onVote={(isUp, q) => {
                  updateVote(isUp, q);
                  cast_vote(q, "answer", isUp).then(null, function(){
                      updateVote(!isUp, q);
                  });
              }} />
      </div>
    );
  }


}


export class Questions extends Component {
  componentDidMount(){
      const self = this;
      queryForQuestion(1,1).then(function(data){
          self.setState(data.data);
      });
  }
  render() {
      const self = this;
      var data = this.state || {};
      var q = data.post || {};
      var answers = q.answers || [];
      var user = data.user || {};
    return (
        <div>
                <Header user={user}/>
                <AskQuestion />
        </div>
      );
  }
}
