import PropTypes from "prop-types";
import React, { Component } from "react";
import { fetchJournalDetails } from "../Journals/store/ActionCreator";
import LoadingIndicator, { WithLoadingIndicator } from "../LoadingIndicator";
import AvatarSM from "../AvatarSM";
import DateTime from "../DateTime";
import Loadable from "react-loadable";
import { journalsStore } from "../Journals/store";
import GithubComments from "../GithubComments";
import JournalMeta from "../JournalMeta";
import { fetchJounalStars } from "../Journals/store/ActionCreator";
import { headingLinkStyles, newTabLinkStyles } from "../../Styles/Theme";
import IconSVG from "../IconSVG";
const Markdown = Loadable({
  loader: () => import(/* webpackChunkName: "Markdown" */ "../Markdown"),
  loading: LoadingIndicator
});

export default class JournalDetails extends Component {
  static propTypes = {
    match: PropTypes.object,
    location: PropTypes.object
  };
  state = {
    error: null,
    loading: true,
    details: {},
    stars: null
  };
  async componentDidMount() {
    let { params } = this.props.match;
    this.checkAndUpdateStars(params.journal);
    let details = await fetchJournalDetails(params.journal);
    if (details.statusCode !== 200) {
      this.setState({ error: details });
      return;
    }
    this.setState(
      {
        details: details.body,
        loading: false
      },
      () => {
        document.title = `Journals - ${this.state.details.description}`;
      }
    );
  }
  checkAndUpdateStars = journalid => {
    let journal = journalsStore
      .getState()
      .journals.list.find(journal => journal.id === journalid);
    let stars;
    if (journal && typeof journal.stars === "undefined") {
      stars = journal.stars;
    } else {
      this.fetchStars(journalid);
      return;
    }
    this.setState({ stars });
  };
  fetchStars = async journalid => {
    let stars = await fetchJounalStars(journalid);
    this.setState({ stars: parseInt(stars, 10) || 0 });
  };
  renderContent = () => {
    let {
      files,
      description: title,
      id: journalId,
      html_url
    } = this.state.details;
    let [file] = Object.keys(files).map(file => files[file]);
    let { content } = file;
    return (
      <div className={`journal-detail-container container`}>
        <h2>
          <a
            className={`${headingLinkStyles} ${newTabLinkStyles}`}
            href={html_url}
            target="_blank"
          >
            {title}
            <small>
              <IconSVG name="icon-new-tab" />
            </small>
          </a>
        </h2>
        <JournalMeta
          stars_count={this.state.stars}
          comments_count={this.state.details.comments}
        />
        <DateTime datetime={this.state.details.create_at} />
        <AvatarSM
          name={this.state.details.owner.login}
          imgUrl={this.state.details.owner.avatar_url}
          profileLink={this.state.details.owner.html_url}
        />
        <Markdown markdown={content} />
        <GithubComments journalId={journalId} />
      </div>
    );
  };
  render() {
    if (this.state.error) {
      throw new Error(JSON.stringify(this.state.error, null, 2));
    }
    return (
      <WithLoadingIndicator condition={this.state.loading}>
        {this.state.loading ? null : this.renderContent()}
      </WithLoadingIndicator>
    );
  }
}
