import React from 'react';
import './activityFeed.css';
import axios from 'axios';

export default class ActivityFeed extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            records: [],
        }
    }

    componentDidMount() {
        axios.get('/retrieve/activity').then(data => {
            let r = data.data;
            this.setState({records: r});
        }).catch(error => {
            console.log(error);
        });
    }

    render() {
        let records = this.state.records;
        //activity types: Photo Upload, New Comment, User Registration, User Login, User Logout
        return (
            <div className="cs142-activity-feed-main-container">
                <h1 className="cs142-activity-feed-header">Activity Feed</h1>
                {records.map((elem, recordIndex) => (
                    <div className="cs142-activity-feed-record-container" key={elem._id}>
                        <div><h1 className="cs142-activity-feed-flexbox-header">{recordIndex + 1}</h1></div>
                        <div><h1 className="cs142-activity-feed-divider">|</h1></div>
                        <div><p className="cs142-activity-feed-text">{elem.user_name}</p></div>
                        <div><h1 className="cs142-activity-feed-divider">|</h1></div>
                        <div><p className="cs142-activity-feed-text">{elem.activity_type}</p></div>
                        <div><h1 className="cs142-activity-feed-divider">|</h1></div>
                        {(elem.activity_type === 'Photo Upload' || elem.activity_type === 'New Comment' || elem.activity_type === 'New Like' || elem.activity_type === 'Like Removed') ? 
                        <img className="cs142-activity-feed-photo" src={"../../images/" + elem.file_name}/> : null}
                    </div>
                ))}
            </div>
        );
    }
}