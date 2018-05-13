import React, { Component } from 'react';
import './App.css';



function Header(props){
    const profilePic = props.user.name ? <img src={props.user.image || "sources/user.png" } className="userImg"/> : null;
    return (
    <div className="header flex">
        <div className="logo">
            <img src="sources/logo.png" className="width160" />
        </div>

        <div className="flex10">
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

function CommentsList(props){
    const comments = props.comments;
    return (
    <div className="marginLeft30">
        <h5 className="bold"> Comments </h5>
        <ul className="commentsList">
            <li>
                <hr className="margin7-0"/>
            </li>
            { comments.map(c => (<Comment text={c.text} user={c.user} date={c.createdAt} />)) }
            <li>
                <a href="#" className="colorBlue"> add a comment </a>
            </li>
        </ul>
    </div>
    );
}

function Answer(props){
    const answer = props.answer;
    const profilePic = answer.user ? <img src={answer.user.profilePic || "sources/user.png"} className="postUserImg"/> : null;
    return (
        <div className="answer flex margin30">
          <div className="votesAnswer">
              <a href="#"> <img src="sources/up.png" className="width30" /></a>
            <div className="votesNo">{answer.totalVotes || 0}</div>
              <a href="#"> <img src="sources/down.png"  className="width30" /></a>
              <div className="tick marginTop10"><img src="sources/un_ok.png" className="width30"/></div>
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
            <CommentsList comments={answer.comments || []} />

          </div>
          <div className="whiteBlock">  </div>
        </div>


    );
}



function AnswersList(props){
    return ( <div> { props.answers.map(a => <Answer answer={a} />) } </div> );
}


function Question(props){
    var question = props.question;
    const profilePic = question.user ? <img src={(question.user || {}).profilePic || "sources/user.png" } className="postUserImg"/> : null;
    return (
<div className="flex margin30">
      <div className="votesPost marginTop22">
          <a href="#"> <img src="sources/up.png" className="width30" /></a>
            <div className="votesNo">{question.totalVotes || 0}</div>
          <a href="#"> <img src="sources/down.png" className="width30" /></a>
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

            <CommentsList comments={question.comments || []} />

      </div>
      <div className="whiteBlock"> </div>
    </div>


    );
}


function cast_vote(post, isUp){
    const mutation = `
mutation {
  updatePostVote(postId: ${post.id}, increase:${isUp === true}) {
    description
    id
    totalVotes
  }
}`;

}

function upvote(post){
    return cast_vote(post, true)
}

function downvote(post){
    return cast_vote(post, false);
}

function queryForQuestion(questionId, currentUserId){
  const query =  `
query {
	user(id: ${currentUserId}){
    name,
    image,
    points,
    type
  }
  post(id: ${questionId}){
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
    return  fetch("http://smartpol.40k.ro:4000/api", {
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


class App extends Component {
    componentDidMount(){
        const self = this;
        queryForQuestion(1,1).then(function(data){
            self.setState(data.data);
        });
    }
    render() {
        var data = this.state || {};
        var q = data.post || {};
        var answers = q.answers || [];
        var user = data.user || {};
      return (
      <div>
              <Header user={user}/>
              <Question question={q}/>
              <AnswersTitle count={answers.length || 0} />
              <AnswersList answers={answers} />
      </div>
    );
  }
}

export default App;
