import './index.scss';
import axios from 'axios';
import swal from 'sweetalert';

const todosAPI = axios.create({
  baseURL: process.env.API_URL
});


const rootEl = document.querySelector('.root');

const templates = {
  todoList: document.querySelector('#todos-list').content,
  todoItem: document.querySelector('#todos-item').content
}

function render(fragment) {
  rootEl.textContent = "";
  rootEl.appendChild(fragment);
}

async function todoAdd() {
  // value안에 값이 입력될 때까지 대기
  const value = await swal({
    content: {
      element: "input",
      attributes: {
        placeholder: "할일을 입력해주세요!",
        type: "string",
      },
    },
  });
  // 입력받으면 payload로 값을 전달하여
  const payload = {
    title: value,
    complete: false
  }
  if (payload.title == null) {
    return
  }
  // 서버로 전달
  rootEl.classList.add('root--loading')
  const res = await todosAPI.post(`todos/`, payload)
  rootEl.classList.remove('root--loading')
  indexPage()
}

async function indexPage() {
  rootEl.classList.add('root--loading')
  const res = await todosAPI.get(`todos/`)
  rootEl.classList.remove('root--loading')
  const listFragment = document.importNode(templates.todoList, true);

  listFragment.querySelector('.todos-list__add').addEventListener('click', e => {
    todoAdd();
  })

  res.data.forEach(todo => {
    const fragment = document.importNode(templates.todoItem, true);
    const pEl = fragment.querySelector('.todos-item__title');
    const buttonEl = fragment.querySelector('.todos-item__finish');

    if (todo.complete === true) {
      pEl.classList.add('todo-finish');
      buttonEl.textContent = "되돌리기"
      buttonEl.addEventListener('click', async e => {
        rootEl.classList.add('root--loading')
        const res = await todosAPI.patch(`todos/${todo.id}`, {
          complete: false
        })
        rootEl.classList.remove('root--loading')
        pEl.classList.remove('todo-finish')
        buttonEl.textContent = "완료"
        indexPage();
      })
    } else {
      buttonEl.addEventListener('click', async e => {
        rootEl.classList.add('root--loading')
        const res = await todosAPI.patch(`todos/${todo.id}`, {
          complete: true
        })
        rootEl.classList.remove('root--loading')
        indexPage();
      })
    }
    fragment.querySelector('.todos-item__edit').addEventListener('click', async e => {
      const value = await swal({
        content: {
          element: "input",
          attributes: {
            placeholder: "어떤 일로 수정하실지 입력해주세요",
            type: "string",
          },
        },
      });
      const payload = {
        title: value,
        complete: false
      }
      // 서버로 전달
      if (payload.title == null) {
        return
      } else {
        rootEl.classList.add('root--loading')
        const res = await todosAPI.patch(`todos/${todo.id}`, payload)
        rootEl.classList.remove('root--loading')
        indexPage()
      }

    })

    fragment.querySelector('.todos-item__delete').addEventListener('click', async e => {
      rootEl.classList.add('root--loading')
      const res = await todosAPI.delete(`todos/${todo.id}`)
      rootEl.classList.remove('root--loading')
      indexPage();
    })



    pEl.textContent = todo.title;
    listFragment.querySelector('.todos-list').appendChild(fragment);
  })
  render(listFragment);
}

indexPage();
