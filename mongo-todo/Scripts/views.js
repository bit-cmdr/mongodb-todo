// Generated by CoffeeScript 1.3.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['jquery', 'underscore', 'backbone', 'models', 'collections'], function($, _, Backbone, Models, Collections) {
    var BaseView, MainView, ParentView, TodoListView, TodoView, ToolbarView, UserView;
    BaseView = (function(_super) {

      __extends(BaseView, _super);

      function BaseView() {
        return BaseView.__super__.constructor.apply(this, arguments);
      }

      BaseView.prototype.render = function() {
        BaseView.__super__.render.call(this);
        this.trigger('rendered');
        return this;
      };

      return BaseView;

    })(Backbone.View);
    ParentView = (function(_super) {

      __extends(ParentView, _super);

      ParentView.prototype.subviews = [];

      function ParentView(options) {
        this.subviews = [];
        ParentView.__super__.constructor.call(this, options);
      }

      ParentView.prototype.remove = function() {
        this.trigger('removed', this);
        this.removeSubViews();
        this.$el.fadeOut('fast', function() {
          $(this).remove();
        });
        return ParentView.__super__.remove.call(this);
      };

      ParentView.prototype.addSubView = function(view, insertMethod, targetSelector) {
        if (insertMethod == null) {
          insertMethod = 'append';
        }
        if (targetSelector == null) {
          targetSelector = null;
        }
        this.subviews.push(view);
        view.on('removed', this._removeSubView, this);
        if (!targetSelector) {
          this.$el[insertMethod](view.render().el);
        } else {
          this.$el.find(targetSelector)[insertMethod](view.render().el);
        }
        return this;
      };

      ParentView.prototype.removeSubViews = function() {
        _.invoke(this.subviews, 'remove');
        this.subviews = [];
      };

      ParentView._removeSubView = function(view) {
        this.subviews = _.without(this.subviews, view);
      };

      return ParentView;

    })(BaseView);
    MainView = (function(_super) {

      __extends(MainView, _super);

      function MainView() {
        return MainView.__super__.constructor.apply(this, arguments);
      }

      MainView.prototype.el = '#main-content';

      MainView.prototype.initialize = function(options) {
        var _this = this;
        if (options != null ? options.userId : void 0) {
          this.userId = options.userId;
        }
        this.users = new Collections.Users;
        this.todos = new Collections.Todos;
        this.user = new Models.User;
        this.toolbarView = new ToolbarView({
          collection: this.users
        });
        this.userView = new UserView;
        this.todoListView = new TodoListView;
        this.listenTo(this.users, 'reset', function() {
          _this.user = _this.users.get(_this.userId);
          _this.renderToolbar();
        });
        return MainView.__super__.initialize.call(this, options);
      };

      MainView.prototype.render = function() {
        MainView.__super__.render.call(this);
        this.users.fetch();
        return this;
      };

      MainView.prototype.renderToolbar = function() {
        var _ref,
          _this = this;
        this.toolbarView.remove();
        this.toolbarView = new ToolbarView({
          collection: this.users
        });
        this.listenTo(this.toolbarView, 'users:add', function() {
          _this.user = new Models.User;
          _this.renderUser();
          Backbone.history.navigate("#0", false);
        });
        this.listenTo(this.toolbarView, 'users:select', function(userModel) {
          _this.user = userModel;
          _this.renderUser();
          Backbone.history.navigate("#" + _this.user.id, false);
        });
        this.listenTo(this.toolbarView, 'save-all', function() {
          _this.users.save();
          if (_this.todos) {
            _this.todos.save();
          }
        });
        this.addSubView(this.toolbarView, 'html');
        if ((_ref = this.user) != null ? _ref.id : void 0) {
          this.toolbarView.setUser(this.user.id);
        }
        if (this.userId) {
          this.renderUser();
        }
        return this;
      };

      MainView.prototype.renderUser = function() {
        var _this = this;
        this.userView.remove();
        this.userView = new UserView({
          model: this.user
        });
        this.listenTo(this.user, 'reset', function() {
          Backbone.history.navigate("#" + _this.user.id, true);
        });
        this.listenTo(this.userView, 'rendered', function() {
          _this.todos = new Collections.Todos({
            url: _this.user.get('tasksUrl')
          });
          _this.listenTo(_this.todos, 'reset', _this.renderTodos);
          _this.renderTodos();
          _this.todos.fetch();
        });
        this.addSubView(this.userView, 'html', '#user');
        return this;
      };

      MainView.prototype.renderTodos = function() {
        this.todoListView.remove();
        this.todoListView = new TodoListView({
          collection: this.todos
        });
        this.addSubView(this.todoListView);
        this.listenTo(this.todoListView, 'rendered', this.renderTodo);
        return this;
      };

      MainView.prototype.renderTodo = function() {
        var view,
          _this = this;
        this.todos.each(function(todoModel) {
          var view;
          view = new TodoView({
            model: todoModel
          });
          _this.addSubView(view, 'append', 'ul');
        });
        view = new TodoView({
          model: new Models.Todo({
            urlRoot: this.todos.url,
            userId: this.user.id
          })
        });
        this.addSubView(view, 'append', 'ul');
        return this;
      };

      return MainView;

    })(ParentView);
    ToolbarView = (function(_super) {
      var _ref;

      __extends(ToolbarView, _super);

      function ToolbarView() {
        return ToolbarView.__super__.constructor.apply(this, arguments);
      }

      ToolbarView.prototype.template = Handlebars.compile((_ref = $('#toolbar-template').html()) != null ? _ref : '');

      ToolbarView.prototype.events = {
        'click #create-user': 'addUser',
        'change #select-user': 'selectUser',
        'click #save': 'save'
      };

      ToolbarView.prototype.initialize = function(options) {
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'change', this.render);
        return ToolbarView.__super__.initialize.call(this, options);
      };

      ToolbarView.prototype.render = function() {
        this.$el.html(this.template(this.collection.toJSON()));
        return ToolbarView.__super__.render.call(this);
      };

      ToolbarView.prototype.addUser = function() {
        this.trigger('users:add');
      };

      ToolbarView.prototype.setUser = function(userId) {
        this.$el.find("#select-user > option[value=" + userId + "]").attr('selected', 'selected');
      };

      ToolbarView.prototype.selectUser = function(ev) {
        this.trigger('users:select', this.collection.get($(ev.target).val()));
      };

      ToolbarView.prototype.save = function() {
        this.trigger('save-all');
      };

      ToolbarView.prototype.toggleNew = function(allow) {
        if (allow === true) {
          $('#add-user').enable();
        } else {
          $('#add-user').disable();
        }
      };

      return ToolbarView;

    })(BaseView);
    UserView = (function(_super) {
      var _ref;

      __extends(UserView, _super);

      function UserView() {
        return UserView.__super__.constructor.apply(this, arguments);
      }

      UserView.prototype.template = Handlebars.compile((_ref = $('#user-template').html()) != null ? _ref : '');

      UserView.prototype.events = {
        'keyup #user-name': 'updateUserName',
        'click #save-user': 'saveUser'
      };

      UserView.prototype.render = function() {
        if (this.model) {
          this.$el.html(this.template(this.model.toJSON()));
        } else {
          this.$el.html(this.template());
        }
        return UserView.__super__.render.call(this);
      };

      UserView.prototype.updateUserName = function(ev) {
        this.model.updateName($(ev.target).val());
      };

      UserView.prototype.saveUser = function(ev) {
        if (ev != null ? ev.preventDefault : void 0) {
          ev.preventDefault();
        }
        this.model.save();
      };

      return UserView;

    })(BaseView);
    TodoListView = (function(_super) {
      var _ref;

      __extends(TodoListView, _super);

      function TodoListView() {
        return TodoListView.__super__.constructor.apply(this, arguments);
      }

      TodoListView.prototype.template = Handlebars.compile((_ref = $('#todo-list-template').html()) != null ? _ref : '');

      TodoListView.prototype.initialize = function(options) {
        if (this.collection) {
          this.listenTo(this.collection, 'reset', this.render);
          this.listenTo(this.collection, 'add', this.render);
          this.listenTo(this.collection, 'remove', this.render);
        }
        return TodoListView.__super__.initialize.call(this, options);
      };

      TodoListView.prototype.render = function() {
        this.$el.html(this.template());
        return TodoListView.__super__.render.call(this);
      };

      return TodoListView;

    })(BaseView);
    TodoView = (function(_super) {
      var _ref;

      __extends(TodoView, _super);

      function TodoView() {
        return TodoView.__super__.constructor.apply(this, arguments);
      }

      TodoView.prototype.template = Handlebars.compile((_ref = $('#todo-template').html()) != null ? _ref : '');

      TodoView.prototype.events = {
        'keyup input.description': 'updateDescription',
        'click input[type=checkbox]': 'toggleComplete',
        'keyup input[type=checkbox]': 'toggleComplete',
        'click .add-task': 'addTask'
      };

      TodoView.prototype.initialize = function(options) {
        this.listenTo(this.model, 'change:completed', this.render);
        return TodoView.__super__.initialize.call(this, options);
      };

      TodoView.prototype.render = function() {
        this.$el.html(this.template(this.model.toJSON()));
        return TodoView.__super__.render.call(this);
      };

      TodoView.prototype.updateDescription = function(ev) {
        console.log($(ev.target).val());
        this.model.updateDescription($(ev.target).val());
      };

      TodoView.prototype.addTask = function(ev) {
        if (ev != null ? ev.preventDefault : void 0) {
          ev.preventDefault();
        }
        this.model.save();
      };

      TodoView.prototype.toggleComplete = function() {
        this.model.toggle();
      };

      return TodoView;

    })(BaseView);
    return {
      MainView: MainView
    };
  });

}).call(this);
