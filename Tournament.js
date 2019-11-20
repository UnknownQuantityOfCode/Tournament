class Tournament {
	constructor(type, options){
		this.type = type || 'single';
		this.team_id_seq = 0;
		this.game_id_seq = 0;
		this.teams = [];
		this.games = {};
		
		this.verbose = (options && options.verbose) ? true : false;
	}

	add_team(name){
		var team = (typeof name == 'object') ? name : {name: name};
		team.id = this.team_id_seq;
		this.teams.push( new Team(team) );
		this.team_id_seq++;
		return team;
	}

	find_team(name){
		return this.teams.find(function(t){
			return (t.name == name || t.id == name);
		});
	}

	add_game(stage, team_1, team_2, winner){
		this.games[stage] = this.games[stage] || [];
		if(typeof(team_1) != "object"){
			team_1 = this.find_team(team_1) || this.add_team(team_1);
		}
		if(typeof(team_2) != "object"){
			team_2 = this.find_team(team_2) || this.add_team(team_2);
		}
		if(winner && typeof(winner) != "object"){
			winner = this.find_team(winner) || {};
		}
		let id = this.game_id_seq++;
		this.games[stage].push(new Game({id: id, teams: [team_1, team_2], winner: winner}) );
	}

	get_stages(){
		return Object.keys(this.games);
	}

	get_games(stage){
		let vp = this;
		if(stage){
			return this.games[stage];
		}else{
			let games = [];
			this.get_stages().forEach(function(s){
				vp.get_games(s).forEach(function(g){
					games.push(g);
				})
			});
			return games.sort(function(a,b){return a.id - b.id});
		}
	}

	find_game(id){
		return this.get_games().find(function(g){
			return (g.id == id);
		});
	}

	create_stage(previous, current){
		var tournament = this;
		var games = this.get_games(previous);
		if(!games || !current || !previous){
			return {};
		}
		var winners = [];
		games.forEach(function(g){
			if(g.winner){
				winners.push(g.winner);
			}else{
				if(tournament.verbose){ console.warn('Game has no winner') };
			}
		});
		var matches = [];
		var teams = [];
		winners.sort(function(a,b){return 0.5 - Math.random()}).forEach(function(w){
			teams.push(w);
			if(teams.length == 2){
				matches.push(teams);
				teams = [];
			}
		});
		if(teams.length){
			teams.push(this.find_team('-') || this.add_team('-'));
			matches.push(teams);
		}
		delete tournament[current];
		matches.forEach(function(m){
			tournament.add_game(current, m[0], m[1], ((m[1].name == '-') ? m[0] : {}) );
		});
	}

	set_winner(game, team){
		game = (typeof game == 'object') ? game : this.find_game(game);
		let winner = (typeof team == 'object') ? team : this.find_team(team);
		game.set_winner(winner);
	}
};

// Game Class
class Game {
	constructor(data){
		this.id = data.id;
		this.teams = data.teams;
		this.winner = data.winner;
	}

	get_team(team){
		if(typeof team == 'object'){
			return this.teams.find(function(t){
				return (t.name == team.name || t.id == team.id);
			})
		}else{
			this.teams.find(function(t){
				return (t.name == team || t.id == team);
			});
		}
	}

	set_winner(team){
		let selected_team = this.get_team(team);
		this.winner = selected_team;
	}

	clear_winner(){
		this.winner = {};
	}
}

// Team Class
class Team {
	constructor(data){
		var team = this;
		Object.keys(data).forEach(function(k){
			team[k] = data[k];
		});
		if(!team.name){
			console.error('Teams require names');
			return false;
		}
	}
}