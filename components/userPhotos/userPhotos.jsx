import React from 'react';
/*
import {
  Typography
} from '@material-ui/core';
*/
//import '@reach/dialog/styles.css'
import './userPhotos.css';
import {
  HashRouter, Link
} from 'react-router-dom';

import axios from 'axios';
//import fetchModel from '../../lib/fetchModelData.js';

/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showComments: false,
      photos: [],
      showAddCommentPrompt: false,
      comments: [],
      photoId: '',
      currentPhoto: 0,
      showWarningPrompt: false,
      selectedPhotoId: '',
      selectedPhotoUserId: '',
      showDeleteErrorMessage: false,
      showNoPhotosMessage: false,
      showDeleteCommentErrorMessage: false,
      numLikes: 0,
      currentUserName: '',
    }

    //this.cancelRef = React.createRef();

    this.addCommentHandler = this.addCommentHandler.bind(this);
    this.handleChangeComment = this.handleChangeComment.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.deletePhotoHandler = this.deletePhotoHandler.bind(this);
    this.retrievePhotos = this.retrievePhotos.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.likeHandler = this.likeHandler.bind(this);
    this.sort = this.sort.bind(this);
  }

  componentDidMount() {
    /*
    this.props.callback('/photos/' + this.props.match.params.userId);
    axios.get('http://localhost:3000/photosOfUser/' + this.props.match.params.userId).then(data => {
      let p = data.data;
      this.setState({photos: p});
    }).catch(error => {
      console.log(error);
    });
    */
   this.retrievePhotos();
   this.setState({currentUserName: this.props.loggedInUser});
  }

  retrievePhotos() {
    this.props.callback('/photos/' + this.props.match.params.userId);
    axios.get('http://localhost:3000/photosOfUser/' + this.props.match.params.userId).then(data => {
      let p = data.data;
      this.setState({photos: p});
      if (p.length === 0) {
        this.setState({showNoPhotosMessage: true});
      }
    }).catch(error => {
      console.log(error);
    });
  }

  onButtonClick = () => {
    this.state.showComments === false ? this.setState({showComments: true}) : this.setState({showComments: false});
  }

  addCommentHandler() {
    this.setState({showAddCommentPrompt: true});
  }

  handleChangeComment(event, id, photoIndex) {
    this.setState({photoId: id});
    console.log(event.target.value);
    const comment = event.target.value;
    let old_comments = this.state.comments;
    old_comments[this.state.currentPhoto] = comment;
    this.setState({comments: old_comments});

    //this.setState({comments: [...this.state.comments, comment]});
    this.setState({currentPhoto: photoIndex});

    //this.setState({comments[currentPhoto]: event.target.value});
    //this.setState({currentPhoto: this.state.currentPhoto + 1});
  }

  handleSubmit(event) {
    event.preventDefault();
    console.log('comments arr: ' + this.state.comments);
    console.log('current photo: ' + this.state.currentPhoto);
    axios.post('http://localhost:3000/commentsOfPhoto/' + this.state.photoId, {
      comment: this.state.comments[this.state.currentPhoto]
    }).then(() => {
      this.uploadCommentCallback();
    }).catch(err => {
      console.log(err);
    })
  }

  uploadCommentCallback = () => {
    this.props.callback('/photos/' + this.props.match.params.userId);
    axios.get('http://localhost:3000/photosOfUser/' + this.props.match.params.userId).then(data => {
      let p = data.data;
      //console.log(p);
      this.setState({photos: p});
    }).catch(error => {
      console.log(error);
    });
  }

  deletePhotoHandler(photo_id) {
    //this.setState({showWarningPrompt: true});
    //this.setState({selectedPhotoId: photo_id});
    //this.setState({selectedPhotoUserId: user_id});
    //this.cancelRef.current.focus();
    axios.delete('http://localhost:3000/delete/photoWithId/' + photo_id, {
      data: { photo_user_id: this.props.match.params.userId}
    }).then(() => {
      console.log('Successfully deleted photo.');
      this.retrievePhotos();
      //this.forceUpdate();
      //window.location.reload(false);
      //this.setState({showWarningPrompt: false});
    }).catch(err => {
      console.log(err);
      this.setState({showDeleteErrorMessage : true});
      //this.setState({selectedPhotoId: photo_id});
    });

  }

  deleteCommentHandler(comment_id, user_id, photo_id) {
    console.log('comment user id: ' + user_id);
    axios.delete('http://localhost:3000/delete/commentWithId/' + comment_id, {
      data: {comment_user_id: user_id,
             photo_id: photo_id}
    }).then(() => {
      console.log('Successfully deleted comment.');
      this.retrievePhotos();
    }).catch(err => {
      console.log(err);
      this.setState({showDeleteCommentErrorMessage: true});
    })
  }

  likeHandler(photo_id) {
    axios.post('http://localhost:3000/likePhotoWithId/' + photo_id).then(() => {
      this.uploadCommentCallback();
    }).catch(err => {
      console.log(err);
    })
  }

  sort(photos) {
    photos.sort(function (one, two) {
      if (one.likes.length < two.likes.legnth) {
        return -1;
      } else if (two.likes.length > one.likes.length) {
        return 1;
      } else {
        return new Date(two.date_time) - new Date(one.date_time);
      }
    });
    return photos;
  }

  render() {
    let photo_arr = this.sort(this.state.photos);

    return (
      <div>
        {this.showNoPhotosMessage && <div><h1>This user has no photos yet.</h1></div>}
        {photo_arr.map((elem, photoIndex) => (
          <div className="cs142-userPhotos-photoContainer" key={elem._id}>
            <img className="cs142-userPhotos-photo" src={"../../images/" + elem.file_name}/>
            <p className="cs142-userPhotos-photoTime"><b>Uploaded on  
            {" " + elem.date_time.substr(0, elem.date_time.indexOf(' '))} at  
            {" " + elem.date_time.substr(elem.date_time.indexOf(' ') + 1)}</b></p>
            <div className="cs142-userPhotos-likesContainer">
              {elem.likes.filter(like => like.user_first_name === this.state.currentUserName).length > 0 ?
              <button className="cs142-userPhotos-likeButton" onClick={() => this.likeHandler(elem._id)}>Unlike</button> 
              : 
              <button className="cs142-userPhotos-likeButton" onClick={() => this.likeHandler(elem._id)}>Like</button> }
              <p className="cs142-userPhotos-likeCounter">{elem.likes.length}</p>
            </div>
            <button className="cs142-userPhotos-deleteButton" onClick={() => this.deletePhotoHandler(elem._id)}>Delete Photo</button>
            {this.state.showDeleteErrorMessage && (<div><i><p className="cs142-userPhotos-delete-error">You can only delete your own photos.</p></i></div>)}
            <div className="cs142-userPhotos-commentsContainer">
              <div className="cs142-userPhotos-buttonsContainer">{elem.comments ? <button className="cs142-userPhotos-viewCommentsButton" onClick={this.onButtonClick}><i>{this.state.showComments === false ? "Show " + elem.comments.length + " " : "Hide"} Comment{elem.comments.length === 1 ? null : "s"}</i></button> : null}
              <button className="cs142-userPhotos-addCommentButton" onClick={this.addCommentHandler}>Add a comment</button></div>
              {this.state.showAddCommentPrompt ? 
              <div className="cs142-userPhotos-formContainer">
              <form className="cs142-userPhotos-form" onSubmit={this.handleSubmit}>
                  <label className="cs142-userPhotos-commentPrompt">
                      Comment: 
                      <input type="text" value={this.state.comments[this.state.currentPhoto]} onChange={event => this.handleChangeComment(event, elem._id, photoIndex)} />
                  </label>
                  <input className="cs142-userPhotos-submit" type="submit" value="Submit" />
              </form>
          </div>
              : null}
              {this.state.showDeleteCommentErrorMessage && (<div><i><p className="cs142-userPhotos-delete-error">You can only delete your own comments.</p></i></div>)}
              {elem.comments ? elem.comments.map(comment => (
                <div key={comment._id}>
                {this.state.showComments && <div className="cs142-userPhotos-commentContainer">
                  <div><HashRouter><Link className="cs142-userPhotos-username" to={"/users/" + comment.user._id}>{comment.user.first_name + " " + comment.user.last_name}</Link></HashRouter>
                  <button className="cs142-userPhotos-deleteCommentButton" onClick={() => this.deleteCommentHandler(comment._id, comment.user._id, elem._id)}>Delete Comment</button>
                  </div>
                  <p className="cs142-userPhotos-commentBody">{comment.comment}</p>
                  <p className="cs142-userPhotos-commentTime">Commented on
                  {" " + comment.date_time.substr(0, comment.date_time.indexOf(' '))} at 
                  {" " + comment.date_time.substr(comment.date_time.indexOf(' ') + 1)}</p>
                </div>}
                </div>
              )) : <p className="cs142-userPhotos-noCommentsMessage">This photo has no comments yet.</p>}
            </div>
          </div>
        ))}
      </div>
    );
  }
}

export default UserPhotos;
