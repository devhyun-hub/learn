function quickselect(
  arr,
  k,
  left = 0,
  right = arr.length - 1,
  compare = defaultCompare
) {
  while (right > left) {
    if (right - left > 600) {
      const n = right - left + 1;
      const m = k - left + 1;
      const z = Math.log(n);
      const s = 0.5 * Math.exp((2 * z) / 3);
      const sd =
        0.5 * Math.sqrt((z * s * (n - s)) / n) * (m - n / 2 < 0 ? -1 : 1);
      const newLeft = Math.max(left, Math.floor(k - (m * s) / n + sd));
      const newRight = Math.min(right, Math.floor(k + ((n - m) * s) / n + sd));
      quickselect(arr, k, newLeft, newRight, compare);
    }

    const t = arr[k];
    let i = left;
    let j = right;

    swap(arr, left, k);
    if (compare(arr[right], t) > 0) swap(arr, left, right);

    while (i < j) {
      swap(arr, i, j);
      i++;
      j--;
      while (compare(arr[i], t) < 0) i++;
      while (compare(arr[j], t) > 0) j--;
    }

    if (compare(arr[left], t) === 0) swap(arr, left, j);
    else {
      j++;
      swap(arr, j, right);
    }

    if (j <= k) left = j + 1;
    if (k <= j) right = j - 1;
  }
  return arr;
}

function swap(arr, i, j) {
  const tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
}

function defaultCompare(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

class RBush {
  constructor(maxEntries = 9) {
    this._maxEntries = Math.max(4, maxEntries);
    this._minEntries = Math.max(2, Math.ceil(this._maxEntries * 0.4));
    this.clear();
  }

  clear() {
    this.data = this._createNode([]);
  }

  insert(item) {
    if (item) this._insert(item, this.data.height - 1);
  }

  _insert(item, level) {
    const toInsert = this._chooseSubtree(item, this.data, level);
    toInsert.children.push(item);
    this._extend(toInsert, item);
    if (toInsert.children.length > this._maxEntries) this._split(toInsert);
  }

  _chooseSubtree(item, node, level) {
    const stack = [];
    let targetNode = node;

    while (true) {
      if (targetNode.leaf || targetNode.height === level) return targetNode;

      let minEnlargement = Infinity;
      let nextNode;

      for (const child of targetNode.children) {
        const enlargement = this._enlargedArea(child, item) - this._area(child);
        if (enlargement < minEnlargement) {
          minEnlargement = enlargement;
          nextNode = child;
        }
      }

      stack.push(targetNode);
      targetNode = nextNode;
    }
  }

  _enlargedArea(a, b) {
    return (
      (Math.max(a.maxX, b.maxX) - Math.min(a.minX, b.minX)) *
      (Math.max(a.maxY, b.maxY) - Math.min(a.minY, b.minY))
    );
  }

  _area(a) {
    return (a.maxX - a.minX) * (a.maxY - a.minY);
  }

  _extend(a, b) {
    a.minX = Math.min(a.minX, b.minX);
    a.minY = Math.min(a.minY, b.minY);
    a.maxX = Math.max(a.maxX, b.maxX);
    a.maxY = Math.max(a.maxY, b.maxY);
  }

  _split(node) {
    const M = node.children.length;
    const m = this._minEntries;

    this._chooseSplitAxis(node, m, M);

    const splitIndex = this._chooseSplitIndex(node, m, M);

    const newNode = this._createNode(
      node.children.splice(splitIndex, node.children.length - splitIndex)
    );
    newNode.height = node.height;
    newNode.leaf = node.leaf;

    this._calculateBBox(node);
    this._calculateBBox(newNode);

    if (node === this.data) {
      this.data = this._createNode([node, newNode]);
      this.data.height = node.height + 1;
    } else {
      return newNode;
    }
  }

  _chooseSplitAxis(node, m, M) {
    const compareMinX = (a, b) => a.minX - b.minX;
    const compareMinY = (a, b) => a.minY - b.minY;

    const xMargin = this._allDistMargin(node, m, M, compareMinX);
    const yMargin = this._allDistMargin(node, m, M, compareMinY);

    if (xMargin < yMargin) {
      node.children.sort(compareMinX);
    } else {
      node.children.sort(compareMinY);
    }
  }

  _allDistMargin(node, m, M, compare) {
    node.children.sort(compare);

    const leftBBox = this._distBBox(node, 0, m);
    const rightBBox = this._distBBox(node, M - m, M);

    let margin = this._bboxMargin(leftBBox) + this._bboxMargin(rightBBox);

    for (let i = m; i < M - m; i++) {
      const child = node.children[i];
      this._extend(leftBBox, child);
      margin += this._bboxMargin(leftBBox);
    }

    for (let i = M - m - 1; i >= m; i--) {
      const child = node.children[i];
      this._extend(rightBBox, child);
      margin += this._bboxMargin(rightBBox);
    }

    return margin;
  }

  _distBBox(node, k, p) {
    const bbox = this._createNode([]);
    for (let i = k; i < p; i++) {
      this._extend(bbox, node.children[i]);
    }
    return bbox;
  }

  _bboxMargin(a) {
    return a.maxX - a.minX + (a.maxY - a.minY);
  }

  _chooseSplitIndex(node, m, M) {
    let index;
    let minOverlap = Infinity;
    let minArea = Infinity;

    for (let i = m; i <= M - m; i++) {
      const bbox1 = this._distBBox(node, 0, i);
      const bbox2 = this._distBBox(node, i, M);

      const overlap = this._intersectionArea(bbox1, bbox2);
      const area = this._area(bbox1) + this._area(bbox2);

      if (overlap < minOverlap) {
        minOverlap = overlap;
        index = i;

        minArea = area < minArea ? area : minArea;
      } else if (overlap === minOverlap) {
        if (area < minArea) {
          minArea = area;
          index = i;
        }
      }
    }

    return index;
  }

  _intersectionArea(a, b) {
    const minX = Math.max(a.minX, b.minX);
    const minY = Math.max(a.minY, b.minY);
    const maxX = Math.min(a.maxX, b.maxX);
    const maxY = Math.min(a.maxY, b.maxY);

    return Math.max(0, maxX - minX) * Math.max(0, maxY - minY);
  }

  _calculateBBox(node) {
    this._distBBox(node, 0, node.children.length, node);
  }

  _createNode(children) {
    return {
      children: children,
      height: 1,
      leaf: true,
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity,
    };
  }

  isEmpty() {
    return this.data.children.length === 0;
  }

  getExtent(extent) {
    const data = this.data;
    return {
      minX: data.minX,
      minY: data.minY,
      maxX: data.maxX,
      maxY: data.maxY,
    };
  }

  concat(rbush) {
    this.data.children.push(...rbush.data.children);
    this._calculateBBox(this.data);
  }

  // below  ===============custom================
  load(extents, values) {
    if (values) {
      const items = new Array(values.length);
      for (let i = 0, l = values.length; i < l; i++) {
        const extent = extents[i];
        const value = values[i];

        /** @type {Entry} */
        const item = {
          minX: extent[0],
          minY: extent[1],
          maxX: extent[2],
          maxY: extent[3],
          value: value,
        };
        items[i] = item;
        this.items_[getUid(value)] = item;
      }
      this.rbush_.load(items);
    } else {
      return values;
    }
  }

  /**
   * 주어진 범위 내의 모든 항목을 검색하는 함수
   * @param {Object} bbox 검색할 범위 (minX, minY, maxX, maxY)
   * @returns {Array} 검색된 항목들
   */
  search(bbox) {
    const node = this.data;
    const result = [];
    const toVisit = [];

    if (!this._intersects(bbox, node)) return result;

    toVisit.push(node);

    while (toVisit.length) {
      const currentNode = toVisit.pop();

      for (const child of currentNode.children) {
        if (this._intersects(bbox, child)) {
          if (currentNode.leaf) {
            result.push(child);
          } else if (this._contains(bbox, child)) {
            this._all(child, result);
          } else {
            toVisit.push(child);
          }
        }
      }
    }

    return result;
  }
  _intersects(a, b) {
    return (
      a.minX <= b.maxX &&
      a.minY <= b.maxY &&
      a.maxX >= b.minX &&
      a.maxY >= b.minY
    );
  }

  _contains(a, b) {
    return (
      a.minX <= b.minX &&
      a.minY <= b.minY &&
      a.maxX >= b.maxX &&
      a.maxY >= b.maxY
    );
  }
}

export default RBush;
