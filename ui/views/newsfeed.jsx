'use babel'
import React from 'react'
import pull from 'pull-stream'
import mlib from 'ssb-msgs'
import Dipswitch from '../com/form-elements/dipswitch'
import Tabs from '../com/tabs'
import MsgList from '../com/msg-list'
import Card from '../com/msg-view/card'
import Oneline from '../com/msg-view/oneline'
import * as HelpCards from '../com/help/cards'
import app from '../lib/app'
import social from '../lib/social-graph'

const LISTITEMS = [
  { label: <i className="fa fa-picture-o" />, Component: Card },
  { label: <i className="fa fa-th-list" />, Component: Oneline }
]
const LISTITEM_CARD = LISTITEMS[0]
const LISTITEM_ONELINE = LISTITEMS[1]

function followedOnlyFilter (msg) {
  return msg.value.author === app.user.id || social.follows(app.user.id, msg.value.author)
}

export default class NewsFeed extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isToolbarOpen: true,
      listItem: LISTITEM_CARD,
      isFollowedOnly: false
    }
  }

  cursor (msg) {
    if (msg)
      return [msg.value.timestamp, msg.value.author]
  }

  helpCards() {
    return <div className="cards-flow">
      <HelpCards.NewsFeed />
      <HelpCards.Pubs />
      <HelpCards.FindingUsers />
    </div>
  }

  onToggleToolbar() {
    this.setState({ isToolbarOpen: !this.state.isToolbarOpen }, () => {
      this.refs.list.calcContainerHeight()
    })
  }

  onSelectListItem(listItem) {
    this.setState({ listItem: listItem })
  }

  onToggleFollowedOnly(b) {
    this.setState({ isFollowedOnly: b }, () => {
      this.refs.list.reload()
    })
  }

  render() {
    const ListItem = this.state.listItem.Component
    const Toolbar = (props) => {
      if (!this.state.isToolbarOpen) {
        return <div className="toolbar floating">
          <a className="btn" onClick={this.onToggleToolbar.bind(this)}><i className="fa fa-caret-square-o-down" /></a>
        </div>
      }
      return <div className="toolbar">
        <a className="btn" onClick={this.onToggleToolbar.bind(this)}><i className="fa fa-caret-square-o-up" /></a>
        <span className="divider" />
        <Dipswitch label="Followed Only" checked={this.state.isFollowedOnly} onToggle={this.onToggleFollowedOnly.bind(this)} />
        <span className="divider" />
        <Tabs options={LISTITEMS} selected={this.state.listItem} onSelect={this.onSelectListItem.bind(this)} />
      </div>
    }
    const filter = msg => {
      if (this.state.isFollowedOnly)
        return followedOnlyFilter(msg)
      return true
    }

    return <div id="newsfeed">
      <MsgList
        ref="list"
        threads
        composer composerProps={{isPublic: true, placeholder: 'Write a new public post'}}
        queueNewMsgs
        dateDividers
        filter={filter}
        Toolbar={Toolbar}
        ListItem={ListItem}
        live={{ gt: [Date.now(), null] }}
        emptyMsg="Your newsfeed is empty."
        append={this.helpCards.bind(this)}
        source={app.ssb.patchwork.createNewsfeedStream}
        cursor={this.cursor} />
    </div>
  }
}