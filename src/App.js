import React, { Component } from 'react';
import { Route, Link, withRouter } from 'react-router-dom';
import logo from './logo.svg';
import './styles/App.css';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import Button from '@material-ui/core/Button';

import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import ClearIcon from '@material-ui/icons/Clear';
import HelpIcon from '@material-ui/icons/Help';

import TextField from '@material-ui/core/TextField';

import CircularProgress from '@material-ui/core/CircularProgress';

import Popover from '@material-ui/core/Popover';

import RootRef from '@material-ui/core/RootRef';

const defaults = [
  { name: 'Pure Protein bar', calories: 200,  protein: 20, weight: 50 },
  { name: 'Egg whites',       calories: 120,  protein: 28, weight: 252 },
  { name: 'Ground beef',      calories: 765,  protein: 95, weight: 450 },
  { name: 'Snack Pack jello', calories: 5,    protein: 0,  weight: 99 },
  { name: 'Potatoes',         calories: 297,  protein: 8,  weight: 400 },
  { name: 'White rice',       calories: 365,  protein: 7,  weight: 100 },
  { name: 'Ground turkey',    calories: 590,  protein: 82, weight: 454 },
  { name: 'Pepperoni pizza',  calories: 1290, protein: 50, weight: 537 },
  { name: 'Breyers Delights', calories: 280,  protein: 16, weight: 286 },
  { name: 'Broccoli',         calories: 34,   protein: 2.8, weight: 100 }
];

class App extends Component {

  state = {
    page: '/',
    foods: [],
    loadingFoods: true,
    bulkWeight: 0,
    cutWeight: 1,
    goal: 'cbulk'
  };

  foodDB;

  constructor() {
    super();

    var request = indexedDB.open("FoodRank", 1);

    request.onsuccess = (e) => {
      this.foodDB = e.target.result;
      this.getFoods();
    };

    request.onupgradeneeded = (e) => {
      var db = e.target.result;

      if (db.objectStoreNames.contains("food")) {
        db.deleteObjectStore("food");
      }
      db.createObjectStore("food", {keyPath: "name"});
    };
  }

  componentWillMount() {
    this.setState({ page: window.location.pathname });
    this.props.history.listen((e) => {
      this.setState({ page: e.pathname });
    });
  }

  getFoods = () => {
    let trans = this.foodDB.transaction("food", "readonly");
    trans.objectStore("food").getAll().onsuccess = (e) => {
      this.setState({ ...this.state, foods: e.target.result, loadingFoods: false },);
    }
  }

  addFood = () => {
    let trans = this.foodDB.transaction("food", "readwrite");
    let store = trans.objectStore("food");
    let state = this.state;
    store.put({ name: state.txtName,
                calories: Number(state.txtCalories) || 0, weight: Number(state.txtWeight) || 0, protein: Number(state.txtProtein) || 0 });
    this.setState({ ...state, txtName: '', txtCalories: '', txtWeight: '', txtProtein: '' });
    this.getFoods();
  }

  deleteFood = (foodName) => {
    let trans = this.foodDB.transaction("food", "readwrite");
    let store = trans.objectStore("food");
    store.delete(foodName);
    this.getFoods();
  }

  changeGoal = (e) => {
    let goal = e.target.value;
    if (goal === 'bulk') {
      this.setState({ bulkWeight: 1, cutWeight: 0, goal });
    }
    else if (goal === 'cut') {
      this.setState({ bulkWeight: 0, cutWeight: 1, goal });
    }
    else {
      this.setState({ bulkWeight: .33, cutWeight: .67, goal });
    }
  }

  sliderChanged = (e, value) => {
    let cutWeight = parseFloat(value / 100);
    this.setState({ bulkWeight: 1 - cutWeight, cutWeight });
  }

  updateVal = (e) => {
    this.setState({...this.state, [e.target.name]: e.target.value });
  }

  editFood = (food) => {
    this.setState({ ...this.state, txtName: food.name, txtCalories: food.calories, txtWeight: food.weight, txtProtein: food.protein });
    this.calInput.focus();
  }

  clearInputs = () => {
    this.setState({ ...this.state, txtName: '', txtCalories: '', txtWeight: '', txtProtein: '' });
  }

  focusName = () => {
    this.nameInput.focus();
  }

  componentDidUpdate = () => {
    if (this.state.focusName) {
      this.focusName();
      this.setState({ focusName: false });
    }
  }

  loadExamples = () => {
    this.setState({ loadingFoods: true }, () => {
      let trans = this.foodDB.transaction("food", "readwrite");
      let store = trans.objectStore("food");
      defaults.forEach((food) => {
        store.put(food);
      });
      this.getFoods();
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">{'{ FoodRank }'}</h1>
        </header>
        <nav>
          <Tabs value={this.state.page}
                onChange={(e,i) => this.setState({ page: i })}
                centered={true}>
            <Tab label="Ranking" component={Link} to="/" value="/" />
            <Tab label="Foods" component={Link} to="/foods" value="/foods" />
          </Tabs>
        </nav>
        <main>
          <Route path="/" exact render={() =>
            <React.Fragment>
              {
                this.state.loadingFoods &&
                <div className="spinner-container">
                  <CircularProgress/>
                </div>
              }
              {
                !this.state.loadingFoods && !this.state.foods.length &&
                <div className="no-foods">
                  <div>No foods yet...</div>
                  <Button variant="outlined" component={Link} to="/foods"
                          onClick={() => this.setState({ focusName: true })}>Add some</Button>
                </div>
              }
              {
                !this.state.loadingFoods && !!this.state.foods.length &&
                <Paper className="table table--index">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Food</TableCell>
                        <TableCell>Index</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {
                        this.state.foods.map(food => {
                          let index = this.state.goal === 'cbulk'  ? food.protein / food.calories * 100 :
                                      this.state.goal === 'dbulk' ? food.protein / food.weight * 100 :
                                                                    food.weight / food.calories * 100;
                          // let index = food.calories ? (food.protein / food.calories * 100 * this.state.bulkWeight) +
                          //                             (food.weight / food.calories * 100 * this.state.cutWeight)
                          //                           : Infinity;
                          return { name: food.name, index }
                        })
                        .sort((a, b) => b.index - a.index)
                        .map(food =>
                          <TableRow>
                            <TableCell>{food.name}</TableCell>
                            <TableCell>{Math.round(food.index)}</TableCell>
                          </TableRow>
                        )
                      }
                    </TableBody>
                  </Table>
                </Paper>
              }
              <RadioGroup
                name="goal"
                className="radio-group"
                row={true}
                onChange={this.changeGoal}
                value={this.state.goal}
              >
                <FormControlLabel
                  value="cbulk"
                  control={<Radio color="primary"/>}
                  label="Clean bulk"
                  onClick={this.changeGoal}
                  ref={(cbulkLbl) => this.cbulkLbl = cbulkLbl}
                />
                <RootRef rootRef={(cbulkHelp) => this.cbulkHelp = cbulkHelp}>
                  <IconButton onClick={() => this.setState({ cbulkOpen: true })} >
                    <HelpIcon />
                  </IconButton>
                </RootRef>
                <Popover
                  classes={{ paper: 'popover' }}
                  open={this.state.cbulkOpen}
                  anchorEl={this.cbulkHelp}
                  onClose={() => this.setState({ cbulkOpen: false })}
                  anchorOrigin={{ horizontal: 'right' }}
                >
                  <p>Ranked by a ratio of <b>protein/calories</b>.</p>
                </Popover>
                <FormControlLabel
                  value="dbulk"
                  control={<Radio color="primary"/>}
                  label="Dirty bulk"
                  onClick={this.changeGoal}
                />
                <RootRef rootRef={(dbulkHelp) => this.dbulkHelp = dbulkHelp}>
                  <IconButton onClick={() => this.setState({ dbulkOpen: true })} >
                    <HelpIcon />
                  </IconButton>
                </RootRef>
                <Popover
                  classes={{ paper: 'popover' }}
                  open={this.state.dbulkOpen}
                  anchorEl={this.dbulkHelp}
                  onClose={() => this.setState({ dbulkOpen: false })}
                  anchorOrigin={{ horizontal: 'right' }}
                >
                  <p>Ranked by a ratio of <b>protein/weight</b>.</p>
                </Popover>
                <FormControlLabel
                  value="cut"
                  control={<Radio color="primary"/>}
                  label="Cut"
                  onClick={this.changeGoal}
                />
                <RootRef rootRef={(cutHelp) => this.cutHelp = cutHelp}>
                  <IconButton onClick={() => this.setState({ cutOpen: true })} >
                    <HelpIcon />
                  </IconButton>
                </RootRef>
                <Popover
                  classes={{ paper: 'popover' }}
                  open={this.state.cutOpen}
                  anchorEl={this.cutHelp}
                  onClose={() => this.setState({ cutOpen: false })}
                  anchorOrigin={{ horizontal: 'right' }}
                >
                  <p>Ranked by a ratio of <b>weight/calories</b>.</p>
                </Popover>
              </RadioGroup>
            </React.Fragment>
          } />
          <Route path="/foods" render={() =>
            <React.Fragment>
              <div className="foods-container">
                {
                  this.state.loadingFoods &&
                  <div className="spinner-container">
                    <CircularProgress/>
                  </div>
                }
                {
                  !this.state.loadingFoods && !this.state.foods.length &&
                  <div className="no-foods">
                    <div>No foods yet...</div>
                    <Button variant="outlined" onClick={this.loadExamples} >Load some examples</Button>
                  </div>
                }
                {
                  !this.state.loadingFoods && !!this.state.foods.length &&
                  <Paper className="table table--foods">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Calories</TableCell>
                          <TableCell>Weight (g)</TableCell>
                          <TableCell>Protein (g)</TableCell>
                          <TableCell colSpan={2}></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {
                          this.state.foods.map(food =>
                            <TableRow>
                              <TableCell>{food.name}</TableCell>
                              <TableCell>{food.calories}</TableCell>
                              <TableCell>{food.weight}</TableCell>
                              <TableCell>{food.protein}</TableCell>
                              <TableCell>
                                <IconButton onClick={() => this.editFood(food)} title="Edit">
                                  <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => this.deleteFood(food.name)} title="Delete">
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          )
                        }
                      </TableBody>
                    </Table>
                  </Paper>
                }
              </div>
              <Paper className="table table--add-edit">
                <div>
                  <label className="cell head" >Name</label>
                  <label className="cell">
                    <TextField value={this.state.txtName} onInput={this.updateVal} name="txtName"
                               inputRef={(nameInput) => this.nameInput = nameInput} />
                  </label>
                </div>
                <div>
                  <span className="cell head">Calories</span>
                  <div className="cell">
                    <TextField type="number" value={this.state.txtCalories} onInput={this.updateVal} name="txtCalories"
                               inputRef={(calInput) => this.calInput = calInput} />
                  </div>
                </div>
                <div>
                  <span className="cell head">Weight (g)</span>
                  <div className="cell">
                    <TextField type="number" value={this.state.txtWeight} onInput={this.updateVal} name="txtWeight" />
                  </div>
                </div>
                <div>
                  <span className="cell head">Protein (g)</span>
                  <div className="cell">
                    <TextField type="number" value={this.state.txtProtein} onInput={this.updateVal} name="txtProtein" />
                  </div>
                </div>
                <div>
                  <span className="cell head" />
                  <span className="cell action">
                    <IconButton onClick={this.addFood} title="Add/Update">
                      <SaveIcon />
                    </IconButton>
                    <IconButton onClick={this.clearInputs} title="Clear fields">
                      <ClearIcon />
                    </IconButton>
                  </span>
                </div>
              </Paper>
            </React.Fragment>
          } />
        </main>
      </div>
    );
  }
}

export default withRouter(App);
