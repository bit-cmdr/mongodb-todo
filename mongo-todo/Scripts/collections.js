// Generated by CoffeeScript 1.3.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['underscore', 'backbone', 'models'], function(_, Backbone, Models) {
    var BaseCollection, Todos, Users;
    BaseCollection = (function(_super) {

      __extends(BaseCollection, _super);

      function BaseCollection() {
        return BaseCollection.__super__.constructor.apply(this, arguments);
      }

      BaseCollection.prototype.save = function(options) {
        var method, xhr;
        this.update(this.models, options);
        method = (options != null ? options.force : void 0) ? 'update' : 'patch';
        xhr = this.sync(method, this, options);
        return xhr;
      };

      return BaseCollection;

    })(Backbone.Collection);
    Users = (function(_super) {

      __extends(Users, _super);

      function Users() {
        return Users.__super__.constructor.apply(this, arguments);
      }

      Users.prototype.model = Models.User;

      Users.prototype.url = '/api/users';

      return Users;

    })(BaseCollection);
    Todos = (function(_super) {

      __extends(Todos, _super);

      function Todos() {
        return Todos.__super__.constructor.apply(this, arguments);
      }

      Todos.prototype.model = Models.Todo;

      Todos.prototype.url = '';

      Todos.prototype.initialize = function(options) {
        if (options != null ? options.url : void 0) {
          this.url = options.url;
        }
        return Todos.__super__.initialize.call(this, options);
      };

      Todos.prototype.completed = function() {
        return this.filter(function(model) {
          return model.get('completed') === true;
        });
      };

      Todos.prototype.remaining = function() {
        return this.filter(function(model) {
          return model.get('completed') === false;
        });
      };

      return Todos;

    })(BaseCollection);
    return {
      Users: Users,
      Todos: Todos
    };
  });

}).call(this);
