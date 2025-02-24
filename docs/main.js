let default_link = ""
function generateSidebar(links) {
    let html = '<ul>';

    links.forEach(link => {
        html += `<li><a href="${link.path}">${link.title}</a>`;

        if (link.children && link.children.length > 0) {
            html += `<span class="toggle-btn" onclick="toggleChildren(this)">[+]</span>`;
            html += `<ul class="children">${generateSidebar(link.children)}</ul>`;
        }

        html += '</li>';
    });

    html += '</ul>';
    return html;
}

function toggleChildren(button) {
    const childrenList = button.nextElementSibling;
    if (childrenList.style.display === 'none' || childrenList.style.display === '') {
        childrenList.style.display = 'block';
        button.textContent = '[-]'; // Thay đổi nút thành dấu trừ
    } else {
        childrenList.style.display = 'none';
        button.textContent = '[+]';
    }
}

const createNavItem = (link) => {
    const hasChildren = link.children && link.children.length > 0;
    const navItem = document.createElement('a');
    navItem.className = 'nav-item';

    const navLink = document.createElement('a');
    navLink.className = 'nav-link';

    if (hasChildren) {
        const toggle = document.createElement('i');
        toggle.className = 'fas fa-chevron-right nav-toggle';
        navLink.appendChild(toggle);
    } else {
        const icon = document.createElement('i');
        icon.className = 'fas fa-file-alt';
        navLink.appendChild(icon);
    }

    const icon = document.createElement('i');
    // icon.className = 'fas fa-file-alt';
    navLink.appendChild(icon);

    const text = document.createElement('span');
    text.textContent = link.title;
    navLink.appendChild(text);

    if (link.path) {
        navLink.href = link.path
        navLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (hasChildren) {
                const toggle = navLink.querySelector('.nav-toggle');
                toggle.classList.toggle('open');
                const children = navItem.querySelector('.nav-children');
                children.classList.toggle('show');
            }
            window.history.pushState({}, '', `?path=${link.path}`);
            change_path();
        });
    } else if (hasChildren) {
        navLink.addEventListener('click', () => {
            const toggle = navLink.querySelector('.nav-toggle');
            toggle.classList.toggle('open');
            const children = navItem.querySelector('.nav-children');
            children.classList.toggle('show');
        });
    }

    navItem.appendChild(navLink);

    if (hasChildren) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'nav-children';
        link.children.forEach(child => {
            childrenContainer.appendChild(createNavItem(child));
        });
        navItem.appendChild(childrenContainer);
    }

    return navItem;
}

const init = async () => {
    await fetch("./links.json")
        .then(response => response.json())
        .then(json => {
            default_link = json.default;
            const nav = document.querySelector('nav');
            json.links.forEach(link => {
                nav.appendChild(createNavItem(link));
            });
        });
    await change_path();
    const links = document.querySelectorAll('a');
    links.forEach((item) => {
        item.addEventListener('click', (event) => {
            change_path();
        });
    });
}

const change_path = async () => {
    const params = new URLSearchParams(window.location.search);
    const filePath = params.get("path");

    // Remove all active states
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    function checkPathInLink(link, path) {
        return link.endsWith(path);
    }

    // Find and activate current link
    const activateLink = (path) => {
        const links = document.querySelectorAll('.nav-link');
        for (let link of links) {
            if (checkPathInLink(link.href, path)) {
                link.classList.add('active');
                // Expand parent containers
                let parent = link.closest('.nav-children');
                while (parent) {
                    parent.classList.add('show');
                    const toggle = parent.previousElementSibling.querySelector('.nav-toggle');
                    if (toggle) toggle.classList.add('open');
                    parent = parent.parentElement.closest('.nav-children');
                }
                break;
            }
        }
    };

    const url = filePath != null ? filePath + ".md" : default_link + ".md";
    fetch(url)
        .then(response => {
            if (!response.ok) {
                console.warn(`HTTP error! Status: ${response.status}`);
                window.history.pushState({}, '', `?path=${default_link}`);
                change_path();
            }
            return response.text();
        })
        .then(markdown => {
            document.querySelector("github-md").innerHTML = marked.parse(markdown);
            activateLink(filePath || default_link);
        })
        .catch(error => console.error('Error fetching the markdown file:', error));
}

init();